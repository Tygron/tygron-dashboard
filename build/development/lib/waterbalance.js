
function initCollapsibles() {
	
	var coll = document.getElementsByClassName("collapsible");
	var i;

	for (i = 0; i < coll.length; i++) {
	  coll[i].addEventListener("click", function() {
	    this.classList.toggle("active");
	    var content = this.nextElementSibling;
	    if (content.style.maxHeight){
	      content.style.maxHeight = null;
	    } else {
	      content.style.maxHeight = content.scrollHeight + "px";
	    }
	  });
	}
}


initCollapsibles();
var data = {
	type: "sankey",
	orientation: "h",
	node: {

		pad: 15,
		thickness: 30,
		line: {
			color: "black",
			width: 0.5
		},
		label: ["A1", "A2", "B1", "B2", "C1", "C2"],
		color: ["blue", "red", "green", "yellow", "orange", "brown"]

	},
	link: {
		source: [0, 0, 1, 2, 3, 3],
		target: [2, 3, 3, 4, 4, 5],
		value: [6, 4, 2, 8, 4, 2]
	}
}


var data = [data]


var layout = {
	title: {
		text: "Basic Sankey"
	},
	font: {
		size: 10
	}
}


Plotly.react('myDiv', data, layout)
