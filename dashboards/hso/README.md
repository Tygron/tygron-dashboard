Here will be placed the documentation on the HSO Dashboard:
- How to install
- How to use


# Why an Hydrological System Overview (HSO)?

## What is the HSO?



# How to install the HSO

1. Start the Preview, log in, and create a new project or load an existing project.

2. Create several water level areas:  
   `Current Situation > Areas > Add Empty Area`

3. Add an attribute to the area.  
   - Select the area  
   - Go to **Attributes** (next to *General*)  
   - Add an attribute in the bottom-right corner  

   **Name:** `WaterLevelArea`  
   **Value:** `-1`

   Click **Save New Attribute**.

4. Add a Text Template Panel:  
   `Current Situation > Panels > Add Text Template`  
   - Give the template a name, for example `Hydrological System Overview`  
   - Click **Enlarge** on the *Panel Body*

5. At the bottom of the enlarged panel, click **Insert GeoShare File**.  
   - In the top-right, switch to **Public Share**  
   - Open the folder **dashboards**  
   - Select `hydrologisch systeem overzicht.txt`  
   - Click **Select**  
   - Read and accept the disclaimer

6. Click **Close**.

7. Go to **Template** (next to *General*).  
   - At the bottom, choose which objects to link this template to  
   - Select the water management areas (areas)

8. Return to **General** and click **Apply Template**.  
   - Confirm that you want to apply the template to the detected areas

9. Open the template using the icon in the project.  
   - Recalculate the project  
   - Open the template again

10. Select the desired water module and click **Install**.  
    *Note: this must be the only water module in your project.*

11. After installation, several overlays are created.  
    You can find them here:  
    `Current Situation > Overlays`

12. Set the correct water level.  
    - Select the newly created Water Overlay (Rainfall, Groundwater, or Flooding)  
    - Open the **Configuration Wizard** on the right

13. Go directly to **Step 3.1.1: Water Areas**.  
    - An automatically created area is listed here  
    - We will replace it

14. Click:  
    - **Reset all**  
    - **Select different Attributes for existing Water Areas**  
    - Select the attribute: `WaterLevelArea`

    This sets the water level in the watercourses to `-1 m NAP`.

15. Close the wizard and recalculate the project.

16. Open the text panel again.  
    - Click the browser icon (next to the close button) to open the panel in your browser  
    - The Hydrological System Overview will now be displayed



# How to use the HSO?
