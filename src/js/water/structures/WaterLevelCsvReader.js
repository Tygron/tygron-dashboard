export class WaterLevelCSVReader {

    _startDate = null;
    _endDate = null;
    _includedColumns = [];
    _dataRows = [];
    _includeColumnPredicate = (a) => true;
    _onFinish = null;

    constructor() {

    }

    setStartDate(startDate) {
        if (startDate == null) {
            this._startDate = null;
        } else {
            this._startDate = new Date(startDate);
        }
    }
	
    setEndDate(endDate) {
        if (endDate == null) {
            this._endDate = null;
        } else {
            this._endDate = new Date(endDate);
        }
    }

    setIncludeColumnPredicate(predicate) {
        this._includeColumnPredicate = predicate;
    }

    setOnFinish(onFinish) {
        this._onFinish = onFinish;
    }

    readFromFile(file) {
        this.readFromURL(URL.createObjectURL(file));
    }

    init() {
        this._includedColumns = [];
        this._dataRows = [];
    }

    getResults() {
        return this._dataRows;
    }

    readFromURL(url) {
        const reader = this;
        (async () => {
            reader.init();
            let lineNumber = 0;
            for await (let line of makeTextFileLineIterator(url)) {
                reader._process(lineNumber++, line);
            }
            if (reader._onFinish != null) {
                reader._onFinish(reader);
            }
        })();
    }

    _process(lineNumber, line) {
        if (lineNumber <= 1) {
            this._processHeader(lineNumber, line);
        } else {
            this._processDateLine(line);
        }
    }

    _processHeader(lineNumber, line) {

        let headers = line.split(';');
        let headerLine = [];
        for (let i = 0;i < headers.length;i++) {

            if (lineNumber == 0) {
                this._includedColumns.push(i == 0 || this._includeColumnPredicate == null ? true : this._includeColumnPredicate(headers[i]));
            }
            if (this._includedColumns[i]) {
                headerLine.push(headers[i]);
            }
        }
        this._dataRows.push(headerLine);
    }

    _processDateLine(line) {

        let data = line.split(';');
        if (data.length > 0) {
            try {
                let date = new Date(data[0]);
                if ((this._startDate != null && date < this._startDate) || (this._endDate != null && date > this._endDate)) {
                    return;
                }

            } catch (error) {
                console.log("Failed to init date for " + data[0]);
                return;
            }
        }

        let dataRow = [];
        for (let j = 0;j < data.length && j < this._includedColumns.length;j++) {
            if (this._includedColumns[j]) {
                dataRow.push(data[j]);
            }
        }
        this._dataRows.push(dataRow);

    }

}

async function* makeTextFileLineIterator(fileURL) {

    const utf8Decoder = new TextDecoder("utf-8");

    let regex = /\r\n|\n|\r/gm;
    let startIndex = 0;

    let response = await fetch(fileURL);
    let reader = response.body.getReader();

    let { value: chunk, done: readerDone } = await reader.read();
    chunk = chunk ? utf8Decoder.decode(chunk, { stream: true }) : "";

    for (;;) {

        let result = regex.exec(chunk);
        if (!result) {
            if (readerDone) {
                break;
            }

            let remainder = chunk.substr(startIndex);

            ({ value: chunk, done: readerDone } = await reader.read());

            chunk =
                remainder + (chunk ? utf8Decoder.decode(chunk, { stream: true }) : "");

            startIndex = regex.lastIndex = 0;
            continue;
        }
        
		yield chunk.substring(startIndex, result.index);
        startIndex = regex.lastIndex;
    }
    
	if (startIndex < chunk.length) {
        // last line didn't end in a newline char
        yield chunk.substr(startIndex);
    }
}


