import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let outputChannel: vscode.OutputChannel;

interface PreCommitResult {
    fixes: string[];
    failures: string[];
}

function parsePreCommitOutput(stdout: string, stderr: string): PreCommitResult {
    const result: PreCommitResult = {
        fixes: [],
        failures: []
    };

    const output = stdout + '\n' + stderr;
    const lines = output.split('\n');

    for (const line of lines) {
        if (line.includes('Fixing ')) {
            result.fixes.push(line.trim());
        } else if (line.includes('Failed')) {
            result.failures.push(line.trim());
        }
    }

    return result;
}

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Pre-commit Helper');

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

    context.subscriptions.push(runPreCommitCommand);
}

export function deactivate() {}
