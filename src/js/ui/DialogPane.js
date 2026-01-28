class DialogPane {

    constructor(parent) {

        this.dialogPane = document.createElement("div");
		this.dialogPane.className = 'dialog-background-pane';
        parent.appendChild(this.dialogPane);

        this.centerDialog = document.createElement("div");
        this.centerDialog.className = "dialog-center-pane";
		this.dialogPane.appendChild(this.centerDialog);
		       
        this.infoText = document.createElement("p");
        this.centerDialog.appendChild(this.infoText);
		
		this.buttonBox = document.createElement("div");
		this.buttonBox.className = 'dialog-button-box';
		this.centerDialog.appendChild(this.buttonBox);
		
		
        this.yesButton = document.createElement("button");
        this.yesButton.innerHTML = "Yes";
        this.yesButton.style.display = 'none';
        this.buttonBox.appendChild(this.yesButton);
        this.noButton = document.createElement("button");
        this.noButton.innerHTML = "No";
        this.noButton.style.display = 'none';
        this.buttonBox.appendChild(this.noButton);
    }

    show() {
        this.dialogPane.style.display = 'inherit';
    }

    hide() {
        this.dialogPane.style.display = 'none';
    }

    setInfoText(text) {
        this.infoText.innerHTML = text;
    }

    confirmClose(text, event) {
        this.setInfoText(text);
        this.yesButton.innerHTML = "Close";
        this.yesButton.style.display = "inline";
        this.noButton.style.display = 'none';
		this.show();
        let self = this;
        this.yesButton.onclick = (e) => {
            self.hide();
            if (event != null) {
                event(e);
            }
        };
    }

    yesNo(text, yesEvent, noEvent) {
        this.setInfoText(text);
        this.yesButton.innerHTML = "Yes";
        this.yesButton.style.display = "inline";
        this.noButton.innerHTML = "No";
        this.noButton.style.display = 'inline';
		this.show();
        let self = this;

        this.yesButton.onclick = (e) => {
            self.hide();
            if (yesEvent != null) {
                yesEvent(e);
            }
        };
        this.noButton.onclick = (e) => {
            self.hide();
            if (noEvent != null) {
                noEvent(e);
            }
        };
    }
}