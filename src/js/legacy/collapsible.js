
export function initCollapsibles() {

	var coll = document.getElementsByClassName("collapsible");
	var i;

	for (i = 0; i < coll.length; i++) {
		coll[i].addEventListener("click", function() {

			this.classList.toggle("active");
			var content = this.nextElementSibling;
							
			if (content.classList.contains("delayed")) {
				if (content.style.maxHeight) {
					content.style.maxHeight = null;
				} else {
					content.style.maxHeight = content.scrollHeight + "px";
				}
			} else {
				if (content.style.display === "block") {
					content.style.display = "none";
				} else {
					content.style.display = "block";
				}
			}


		});
	}
}

export function openCollapsibles() {
	var coll = document.getElementsByClassName("collapsible");
	for (i = 0; i < coll.length; i++) {
		const collapsible = coll[i];
		setTimeout(function() {
			collapsible.click();
		}, i * 100);
	}
}
