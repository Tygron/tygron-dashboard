
export function initCollapsibles() {

	let collapsible = document.getElementsByClassName("collapsible");
	
	for (let i = 0; i < collapsible.length; i++) {
		
		collapsible[i].addEventListener("click", function() {

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
	
	let  collapsible = document.getElementsByClassName("collapsible");
	for (i = 0; i < collapsible.length; i++) {
		
		const collapsible = collapsible[i];
		setTimeout(function() {
			collapsible.click();
		}, i * 100);
	}
}
