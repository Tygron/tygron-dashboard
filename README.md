# Tygron Platform Dashboarding Library

Toolset based on HTML5, CSS, Javascript, for the creation of Dashboards and other informative and interactive displays for Projects in the Tygron Platform.

This toolset is offered as-is, under the MIT license. This toolset is not part of the core Tygron Platform technology.

## Description

This toolset is intended to be used for the creation of advanded dashboards and interfaces to be used in combination with the Tygron Platform. It is developed as a code-base, and through a build-process and implementation-specific recipes multiple dashboards and other tools are created which can be directly used in the Tygron Platform Project.

The resulting implementations are intended to be offered for use integrated in the Tygron Platform via the Public Share functionality, and can similarly be obtained manually.

## Using the toolset:

The toolset offers pre-built libraries and applications which can be directly used in Tygron Platform Projects.

### Pre-made dashboards

Pre-made dashboards can be obtained from the "build" folder. The following variants are available:

<dl>
<dt>*.html</dt>
<dd>A full webpage including HTML, CSS, Javascript containing all required functionality.</dd>

<dt>*.txt</dt>
<dd>A partial implementation, for use in a context where html sections are auto-added, or where the end-result can be pure Javascript or CSS.</dd>
</dl>

### Library

Besides the pre-made dashboards offered up as part of the code-base, users are encouraged to create their own implementations as well. To facilitate this, the generic toolset can also be obtained as a standalone library. This can allow for customized or proprietary tooling based on this toolset, whilst also allowing for an easily updated codebase.

1. Obtain the library source from the built jsLib.txt file.
2. Place the library source in a (Single) Text Panel.
3. Take note of the Panel's ID
4. The library can now be imported from another Indicator or Panel with the following tag (where "%ID%" is the library Panel's ID):
```html
<script src='/web/panel.body?id=%ID%&token=$TOKEN'></script>
```

## Developing the toolset:

### Eclipse IDE

Development of the toolkit is done using Eclipse Enterprise for Java and Web Developers.

### Code structure

The repository is structured as follows:

<dl>
<dt>src</dt>
<dd>Source code files for the toolset, composing the generically required and applicable functionality.</dd>

<dt>dashboards</dt>
<dd>Recipes for specific implementations of the toolset, which rely on the generic functionality but may contain use-case specific terms, styling, references, or functions.</dd>

<dt>build</dt>
<dd>The end-products and deployable files, to be used in the Tygron Platform.</dd>

<dt>test</dt>
<dd>Jest-compatible unit test files.</dd>

<dt>lib</dt>
<dd>Miscellaneous files and libraries for workspace functionality.</dd>
</dl>
	
### Local build

Builds are made using Ant and the build.xml file. As builds are generated automatically through Github workflows, local builds can be made into a separate directory by running with the following parameter:
```
-Dservertype=local
```
	
### Automated remote build and test

Github workflows are used to automatically build and unittest the developed codebase.

On a push to the main branch, new builds are automatically created on the main branch. The workflow for this is defined in:
```
.github/workflows/ant.yml
``` 

On a push to the main branch, unittests are automatically run on the main branch. The workflow for this is defined in:
```
.github/workflows/unittest.yml
``` 
	
### Manual remote test

Tests can be manually run using the GitHub Codespaces functionality. A default configuration is set up in:
```
.devcontainer/devcontainer
```
Upon starting a codespace, the following commands can be used to prepare and start a unittest run:
```
npm ci
npm test
```
