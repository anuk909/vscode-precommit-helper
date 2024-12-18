import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const preCommitOutput = vscode.window.createOutputChannel('Pre-commit');

    let disposable = vscode.commands.registerCommand('vscode-precommit-helper.interceptCommit', async () => {
        preCommitOutput.clear();
        preCommitOutput.show(true); // Force the output channel to take focus

        const terminal = vscode.window.createTerminal('pre-commit');
        terminal.show();

        return new Promise((resolve) => {
            terminal.sendText('pre-commit run --files $(git diff --cached --name-only) 2>&1 | tee /tmp/pre-commit-output');

            const closeListener = vscode.window.onDidCloseTerminal(async t => {
                if (t === terminal) {
                    closeListener.dispose();

                    // Read the output from the temporary file
                    const fs = require('fs');
                    try {
                        const output = fs.readFileSync('/tmp/pre-commit-output', 'utf8');
                        preCommitOutput.appendLine('Pre-commit Output:');
                        preCommitOutput.appendLine('='.repeat(20));
                        preCommitOutput.appendLine(output);
                        preCommitOutput.appendLine('='.repeat(20));

                        if (t.exitStatus?.code === 0) {
                            await vscode.commands.executeCommand('git.commit');
                            const message = 'Changes committed successfully!';
                            vscode.window.showInformationMessage(message, 'Show Details').then(selection => {
                                if (selection === 'Show Details') {
                                    preCommitOutput.show(true);
                                }
                            });
                        } else {
                            const message = 'Pre-commit checks failed. Please fix the issues and try again.';
                            vscode.window.showErrorMessage(message, 'Show Details').then(selection => {
                                if (selection === 'Show Details') {
                                    preCommitOutput.show(true);
                                }
                            });
                        }
                    } catch (err) {
                        vscode.window.showErrorMessage('Failed to read pre-commit output');
                    }
                    resolve(undefined);
                }
            });
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
