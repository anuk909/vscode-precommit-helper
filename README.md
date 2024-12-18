# Pre-commit Helper for VSCode

Improves the integration of pre-commit hooks with VSCode's UI-based commits by providing clear output visibility and better error reporting.

## Features

- **Automatic Pre-commit Checks**: Runs pre-commit hooks automatically when saving staged files
- **Clear Output Visibility**: Shows pre-commit output directly in VSCode's UI
- **Detailed Error Reporting**: When pre-commit fails, clearly shows what went wrong
- **Fix Notifications**: Displays what pre-commit fixed in your files
- **Quick Access**: One-click access to detailed output through notification buttons

![Pre-commit Helper in Action](images/precommit-helper.png)

## Requirements

- VSCode 1.96.0 or higher
- Git installed and configured
- pre-commit installed (`pip install pre-commit`)
- A `.pre-commit-config.yaml` file in your repository

## Installation

1. Install the extension from the VSCode Marketplace
2. Ensure you have pre-commit installed:
   ```bash
   pip install pre-commit
   ```
3. Have a `.pre-commit-config.yaml` file in your repository
4. Run `pre-commit install` in your repository

## Usage

1. Stage your files using VSCode's source control UI
2. Save your files to trigger pre-commit checks
3. View pre-commit output in the notifications
4. Click "Show Details" to see full pre-commit output

The extension will automatically run pre-commit on staged files when you save them, showing you:
- What files were checked
- What fixes were applied
- Any errors that occurred
- Detailed failure messages

## Commands

The extension provides the following commands:

- `Show Pre-commit Output`: Opens the pre-commit output panel
- `Clear Pre-commit Output`: Clears the pre-commit output panel

## Known Issues

- Pre-commit must be installed and configured in your repository
- The extension only runs pre-commit on staged files
- Some pre-commit hooks may require additional dependencies

## Release Notes

### 0.0.1

Initial release of Pre-commit Helper:
- Automatic pre-commit checks on staged files
- Clear output visibility
- Detailed error reporting
- Fix notifications
- Quick access to output through notifications

## Contributing

Found a bug or have a feature request? Please open an issue on our [GitHub repository](https://github.com/devin-ai/vscode-precommit-helper).

## License

This extension is licensed under the [MIT License](LICENSE).
