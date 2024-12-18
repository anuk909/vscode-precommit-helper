# VSCode Pre-commit Helper

A VSCode extension that improves pre-commit integration with VSCode's UI by providing clear output visibility and better error reporting.

## Features

- Run pre-commit hooks directly from VSCode's SCM menu
- Clear output visibility in VSCode's UI
- Detailed error reporting when pre-commit fails
- Fix notifications showing what pre-commit fixed in your files
- One-click access to detailed output through notification buttons

## Requirements

- VSCode 1.74.0 or higher
- Git installed and configured
- pre-commit installed (`pip install pre-commit`)

## Installation

1. Download the .vsix file from the releases page
2. In VSCode, open the Command Palette (Ctrl+Shift+P)
3. Type "Install from VSIX" and select it
4. Choose the downloaded .vsix file

## Usage

1. Open a Git repository in VSCode
2. Click the "Run Pre-commit Checks" button in the SCM view
3. View the output in the Pre-commit Helper output channel

## Extension Settings

This extension contributes the following commands:

* `vscode-precommit-helper.runPreCommit`: Run pre-commit checks on the current repository

## Known Issues

None at this time.

## Release Notes

### 0.0.1

Initial release:
- Added manual pre-commit trigger
- Implemented clear output visibility
- Added detailed error reporting
