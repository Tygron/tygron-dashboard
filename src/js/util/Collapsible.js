
export function initCollapsibles() {

	let coll = document.getElementsByClassName("collapsible");
	
	for (let i = 0; i < coll.length; i++) {
		
		coll[i].addEventListener("click", function() {

			this.classList.toggle("active");
			let content = this.nextElementSibling;
			let style = content.style;

			if (content.classList.contains("delayed")) {
				
				if (style.maxHeight) {
					style.maxHeight = null;
				} else {
					style.maxHeight = content.scrollHeight + "px";
				}
			
			} else {
				style.display = style.display === "block" ? "none" : "block";
			}


		});
	}
}

export function openCollapsibles() {
	
	let  coll = document.getElementsByClassName("collapsible");
	for (i = 0; i < coll.length; i++) {
		
		const collapsible = coll[i];
		setTimeout(function() {
			collapsible.click();
		}, i * 100);
	}
}
