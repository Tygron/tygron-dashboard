# Why an Hydrological System Overview (HSO)?
The development of hydrological models typically follows several steps. First, the model is set up by adding the relevant data to the software. After this, an initial simulation can be run to evaluate the results. Often, the model will not yet perform as intended. In that case, adjustments are required. Sometimes better input data is needed, or calibration steps must be taken to improve parameter values. When a simulation does produce the expected outcomes, the base model is considered ready. From that point onward, different scenarios can be evaluated.

[placeholder afbeelding Modelleren in Tygron] (dashboards/hso/readmeimages/ModelrunTygron.png)

The goal of the HSO is to simplify the process of test-running and calibrating a model. In any model, and especially in a raster-based model with many adjustable parameters, it is essential to maintain a clear understanding of what is happening internally. The HSO provides insight into the hydrological system itself, the water balance, and the functioning of all hydraulic structures. This contributes to better control and a deeper understanding of the model.

[placeholder afbeelding profdraaine en kalibreren] (dashboards/hso/readmeimages/ModelCalibrationTygron.png)


When the base model meets expectations and scenario simulations begin, it once again becomes crucial to understand what the results represent. At this stage as well, the HSO supports the modeller in interpreting the outcomes.

# The HSO compared to the Waterbalance in the Client
In the client, a water balance is also available. This panel also presents a water balance, but it is primarily focused on visualizing the error that has occurred in the calculation. It does show total quantities, but these are not available per time step, for example. For this reason, users expressed the need for a more detailed overview.

[placeholder afbeelding Show Water Balance] 

# What is the HSO?

The HSO consists of two main components:
- Water balance
- Structures

## Water Balance
The water balance consists of the following components:

- Water Balance Table
- Volume Plot
- Flow Table
- Sankey Diagram

### Water Balance Table
The Water Balance Table shows the volume of water per time step for the area to which the HSO is linked. This represents the amount of water in cubic meters, or the water volume, present in the different water storage compartments of the model.

These values represent the amount of water present at the end of a given time frame or time step.

### Volume Plot
The Volume Plot is a bar chart representation of the Water Balance Table. Using the slider, different time steps can be explored.

### Flow Table
The Flow Table is a more detailed table than the Water Balance Table. It shows the different flows that occurred during a time step between the different water storage compartments. These are volumes per time step.

### Sankey Diagram
The Sankey Diagram visualizes how water flows through the system. It shows from which water storage compartments the water flows to the next storage component. 
This also includes Area In and Area Out, representing the aggregated inflow to and outflow from the area associated with the HSO.

For a complete overview of all possible flows in Tygron, see this HTML reference: [placeholder].

## Structures
The HSO provides access to different types of hydrological structures present in the area to which it is linked.  
All structure types follow the same information layout.

For each structure, the following sections are available:

- Parameters  
- Results  
- Details  
- Formula  

### Parameters
This table displays the parameters configured in the model for the selected structure type. 
Only the parameters of structures located within the area to which the HSO is linked are displayed.


### Available Structure Types

- Culverts  
- Weirs  

The HSO is explicitly not intended for adjusting values. It functions as a thermometer that reflects what is currently present in the model.

To achieve this, several components have been set up. At a high level, these can be divided into the water balance and the hydrological objects, also referred to as structures.



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
By installing the HSO, a Water Overlay is created. During installation, you can choose to create a **Groundwater**, **Rainfall**, or **Flooding** overlay. Several child overlays and combo overlays are generated as well. These overlays make it possible to build and visualize the Hydrological System Overview.

## Water level areas
The HSO is linked to a water level area. All information and insights shown in the HSO apply only to this selected area.

## HSO interface
After installing the HSO, several tabs become available.

### Hydrological System Overview
This tab provides an overview of all hydrological processes taking place. For example, it shows how much water is present after the first simulation timestep.


## Licensing
The overview is released under the MIT License. This means that you are free to use, modify, and distribute the software, provided that the original copyright notice and license text are included in any copies or substantial portions of the software.

MIT License

Copyright (c) 2025 Tygron

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
