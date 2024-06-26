import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.installPythonPackage', async (packageName: string) => {
            if (packageName && await confirmInstall(packageName)) {
                installPackage(packageName);
            } else {
                vscode.window.showInformationMessage('No package selected or installation cancelled.');
            }
        })
    );

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('python', new InstallPythonPackageProvider(), {
            providedCodeActionKinds: InstallPythonPackageProvider.providedCodeActionKinds
        })
    );
}

async function confirmInstall(packageName: string): Promise<boolean> {
    return true;
}

function installPackage(packageName: string) {
    const terminal = vscode.window.createTerminal('Python Package Installer');

    terminal.show();
	setTimeout(() => {
		terminal.sendText(`pip install ${packageName}`);
	}, 2000);
}

class InstallPythonPackageProvider implements vscode.CodeActionProvider {

    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.CodeAction[] {
        const selectedText = document.getText(range).trim();

        if (selectedText) {
            return [this.createFix(document, range, selectedText)];
        }
        return [];
    }

    private createFix(document: vscode.TextDocument, range: vscode.Range, packageName: string): vscode.CodeAction {
        const fix = new vscode.CodeAction(`Install ${packageName}`, vscode.CodeActionKind.QuickFix);
        fix.command = { command: 'extension.installPythonPackage', title: 'Install Python Package', arguments: [packageName] };
        return fix;
    }
}

export function deactivate() {}