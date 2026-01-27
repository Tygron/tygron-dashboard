import { connector } from "./Connector.js";

export class Installer {


    _connector;
    _chain;

    init(appToken) {
        this._connector = connector(appToken);
        this._chain = this._connector.start();
    }

    appendChains(functions) {
		if (typeof functions === 'function') {
		    this._chain = this._chain.then(this._connector.chain(functions));
		
		}else if(Array.isArray(functions)){
			for (let func of functions) {
				this.appendChains(func);
			}
		}else{
			console.log("Installer.AppendChains argument is ignored. It is not a function nor an array: " + functions);
		}
    }

    getConnector() {
        return this._connector;
    }

    catch(catcher) {
        this._chain = this._chain.catch(error => catcher(error));
    }
}