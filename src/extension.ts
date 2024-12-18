import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface GitStatus {
    uri: vscode.Uri;
    staged: boolean;
}

interface PreCommitResult {
    passed: boolean;
    fixes: string[];
    failures: string[];
}

let outputChannel: vscode.OutputChannel;

function parsePreCommitOutput(stdout: string, stderr: string): PreCommitResult {
    const result: PreCommitResult = {
        passed: !stderr,
        fixes: [],
        failures: []
    };

    const lines = stdout.split('\n');
    for (const line of lines) {
        if (line.includes('Fixing')) {
            result.fixes.push(line.trim());
        }
    }

    if (stderr) {
        const errorLines = stderr.split('\n');
        for (const line of errorLines) {
            if (line.trim() && !line.includes('Failed')) {
                result.failures.push(line.trim());
            }
        }
    }

    return result;
}

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Pre-commit Helper');

    let showOutputCommand = vscode.commands.registerCommand('vscode-precommit-helper.showOutput', () => {
        outputChannel.show();
    });

    let clearOutputCommand = vscode.commands.registerCommand('vscode-precommit-helper.clearOutput', () => {
        outputChannel.clear();
    });

    let runPreCommitCommand = vscode.commands.registerCommand('vscode-precommit-helper.runPreCommit', async () => {
        const gitExtension = vscode.extensions.getExtension('vscode.git');
        if (!gitExtension) {
            vscode.window.showErrorMessage('Git extension not found');
            return;
        }

        try {
            const git = gitExtension.exports;
            const repo = git.repositories[0];
            if (!repo) {
                vscode.window.showErrorMessage('No Git repository found');
                return;
            }

            outputChannel.clear();
            outputChannel.appendLine('Running pre-commit checks...');

            const { stdout, stderr } = await execAsync('pre-commit run');
            const result = parsePreCommitOutput(stdout, stderr);

            outputChannel.appendLine('Pre-commit Results:');
            outputChannel.appendLine('==================');

            if (result.fixes.length > 0) {
                outputChannel.appendLine('\nFixes Applied:');
                result.fixes.forEach(fix => outputChannel.appendLine(`✓ ${fix}`));
            }

            if (result.failures.length > 0) {
                outputChannel.appendLine('\nFailures:');
                result.failures.forEach(failure => outputChannel.appendLine(`✗ ${failure}`));
                vscode.window.showErrorMessage(
                    'Pre-commit failed. Click "Show Details" to see what failed.',
                    'Show Details'
                ).then(selection => {
                    if (selection === 'Show Details') {
                        outputChannel.show();
                    }
                });
            } else {
                vscode.window.showInformationMessage(
                    'Pre-commit checks passed successfully.',
                    'Show Details'
                ).then(selection => {
                    if (selection === 'Show Details') {
                        outputChannel.show();
                    }
                });
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error running pre-commit:', errorMessage);
            outputChannel.appendLine('Error running pre-commit:');
            outputChannel.appendLine(errorMessage);
            outputChannel.show();
        }
    });

    context.subscriptions.push(showOutputCommand);
    context.subscriptions.push(clearOutputCommand);
    context.subscriptions.push(runPreCommitCommand);
    context.subscriptions.push(outputChannel);
}

export function deactivate() {
    if (outputChannel) {
        outputChannel.dispose();
    }
}
