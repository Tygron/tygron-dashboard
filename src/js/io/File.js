
export function addDownloadHandler(element, fileName, contentFunction) {

    element.addEventListener('click', () => {

        let content = contentFunction();
        let blob = new Blob([content], { type: 'text/plain' });

        // temp link 
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();

        // cleanup
        URL.revokeObjectURL(link.href);
    });
}

export function toCSVContent(data, properties, titles, timeframes) {
    if (Array.isArray(data)) {
        return _toCSVContentArray(data, properties, titles, timeframes);
    } else {
        return _toCSVContentObject(data, properties, titles, timeframes);
    }
}

function _toCSVContentObject(data, properties, titles, timeframes) {

    let csvContent = "";

    for (let i = 0;i < properties.length;i++) {
        csvContent += titles[properties[i]];
        csvContent += i < properties.length - 1 ? "," : "\r\n";
    }

    for (let t = 0;t < timeframes;t++) {
        for (let i = 0;i < properties.length;i++) {
            csvContent += data[properties[i]][t];
            csvContent += i < properties.length - 1 ? "," : "\r\n";
        }
    }
    return csvContent;
}

function _toCSVContentArray(data, properties, titles, timeframes) {

    let csvContent = "";

    for (let e = 0;e < data.length;e++) {
        let entry = data[e];
        for (let i = 0;i < properties.length;i++) {
            csvContent += entry[properties[0]] + " " + titles[properties[i]];
            csvContent += e == data.length - 1 && i == properties.length - 1 ? "\r\n" : ",";
        }
    }

    for (let t = 0;t < timeframes;t++) {
        for (let e = 0;e < data.length;e++) {
            let entry = data[e];
            for (let i = 0;i < properties.length;i++) {

                if (entry.hasOwnProperty(properties[i])) {

                    csvContent += t < entry[properties[i]].length ?
                        entry[properties[i]][t] :
                        entry[properties[i]][entry[properties[i]].length - 1];

                } else {
                    csvContent += " ";
                }
				
                csvContent += e == data.length - 1 && i == properties.length - 1 ? "\r\n" : ",";
            }
        }
    }
    return csvContent;
}