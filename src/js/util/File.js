
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
	
	let csvContent = "data:text/csv;charset=utf-8,";

	for (let i = 0; i < properties.length; i++) {
		csvContent += titles[properties[i]];
		csvContent += i < properties.length - 1 ? "," : "\r\n";
	}
	
	for (let t = 0; t < timeframes; t++) {
		for (let i = 0; i < properties.length; i++) {
			csvContent += data[properties[i]][t];
			csvContent += i < properties.length - 1 ? "," : "\r\n";
		}
	}

	return csvContent;

}