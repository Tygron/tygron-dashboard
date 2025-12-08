import { hasRequiredAttributes } from "./ItemUtils.js"

export function isTemplateTextPanel(panel, templateMapLink, templateAttribute, requiredAttributes) {
	// Is non template?	
	if (panel == null || panel.autoApplied == null) {
		return false;
	}

	// Check template panel type
	if (panel.excelID != null) {
		return false;
	}

	if (templateMapLink != null && panel.mapLink != templateMapLink) {
		return false;
	}

	if (templateAttribute != null && panel.attribute != templateAttribute) {
		return false;
	}

	if (hasRequiredAttributes != null && !hasRequiredAttributes(panel, requiredAttributes)) {
		return false;
	}

	return true;

}

export function getTemplateTextPanel(panels, templateMapLink, templateAttribute, requiredAttributes) {

	if (!Array.isArray(panels)) {
		return panels;
	}

	for (let i = 0; i < panels.length; i++) {

		if (isTemplateTextPanel(panels[i], templateMapLink, templateAttribute, requiredAttributes)) {
			return panels[i];
		}
	}

	return null;


}

export function getTemplateTextPanels(panels, templateMapLink, templateAttribute, requiredAttributes) {

	let templateTextPanels = [];

	if (!Array.isArray(panels)) {
		return templateTextPanels;
	}

	for (let i = 0; i < panels.length; i++) {

		if (isTemplateTextPanel(panels[i], templateMapLink, templateAttribute, requiredAttributes)) {
			templateTextPanels.push(panels[i]);
		}
	}

	return templateTextPanels;
}