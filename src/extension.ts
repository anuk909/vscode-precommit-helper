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

    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (gitExtension) {
        gitExtension.activate().then((git) => {
            if (git) {
                const disposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
                    try {
                        const repo = git.repositories[0];
                        if (!repo) return;

                        const status = await repo.getStatus();
                        const isStaged = status.some((s: GitStatus) => s.uri.fsPath === document.uri.fsPath && s.staged);

                        if (isStaged) {
                            const { stdout, stderr } = await execAsync('pre-commit run --files ' + document.uri.fsPath);
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
                            } else if (result.fixes.length > 0) {
                                vscode.window.showInformationMessage(
                                    'Pre-commit applied fixes. Click "Show Details" to see what was fixed.',
                                    'Show Details'
                                ).then(selection => {
                                    if (selection === 'Show Details') {
                                        outputChannel.show();
                                    }
                                });
                            }
                        }
                    } catch (error: unknown) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        console.error('Error running pre-commit:', errorMessage);
                        outputChannel.appendLine('Error running pre-commit:');
                        outputChannel.appendLine(errorMessage);
                        outputChannel.show();
                    }
                });

                context.subscriptions.push(disposable);
            }
        });
    }

    context.subscriptions.push(showOutputCommand);
    context.subscriptions.push(clearOutputCommand);
    context.subscriptions.push(outputChannel);
}

export function deactivate() {
    if (outputChannel) {
        outputChannel.dispose();
    }
}
