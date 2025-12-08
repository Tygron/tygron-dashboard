import {hasRequiredAttributes} from "./ItemUtils.js"

export function isTemplateTextPanel(panel, templateMapLink, templateAttribute, requiredAttributes) {
	// Is non template?	
	if (panel == null || panel.autoApplied == null) {
		return false;
	}

	// Check template panel type
	if (panel.excelID != null){
		return false;
	}
	
	if(templateMapLink!= null && panel.mapLink!= templateMapLink){
		return false;
	}
	
	if(templateAttribute!= null && panel.attribute != templateAttribute){
		return false;
	}
	
	if(hasRequiredAttributes!= null && !hasRequiredAttributes(panel,requiredAttributes)){
		return false;
	}
	
	return true;

}