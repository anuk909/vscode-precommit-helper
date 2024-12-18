import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
    console.log('Pre-commit Helper extension is now active!');

    const outputChannel = vscode.window.createOutputChannel('Pre-commit Helper');

    const disposable = vscode.commands.registerCommand('vscode-precommit-helper.runPreCommit', async () => {
        try {
            outputChannel.clear();
            outputChannel.show();
            outputChannel.appendLine('Running pre-commit checks...');

            const { stdout, stderr } = await execAsync('pre-commit run --all-files');

            if (stdout) {
                outputChannel.appendLine(stdout);
            }

            if (stderr) {
                outputChannel.appendLine(stderr);
            }

            vscode.window.showInformationMessage('Pre-commit checks completed. Check output for details.');
        } catch (error: any) {
            outputChannel.appendLine(error.message || 'Unknown error occurred');
            vscode.window.showErrorMessage('Pre-commit checks failed. Check output for details.');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
