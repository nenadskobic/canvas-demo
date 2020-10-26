const CANVAS_ROOT_ID = 'canvas';
const CELLS_ID_PREFIX = 'fgrp';

const ROWS_SELECTOR = CANVAS_ROOT_ID.concat('-r');
const COLS_SELECTOR = CANVAS_ROOT_ID.concat('-c');
const CELLS_SELECTOR = CANVAS_ROOT_ID.concat('-').concat(CELLS_ID_PREFIX);
const ALL_CONFIGURABLE_CANVAS_ITEMS = 'div[id^='.concat(ROWS_SELECTOR).concat('], div[id^='
    .concat(COLS_SELECTOR).concat('], div[id^=').concat(ROWS_SELECTOR).concat('] > div[id^=').concat(CELLS_SELECTOR).concat('], div[id^=')
    .concat(COLS_SELECTOR).concat('] > div[id^=').concat(CELLS_SELECTOR).concat(']'));

let currentCells = [];
let allConfigurableCanvasItems = [];
const canvasRootNode = document.getElementById(CANVAS_ROOT_ID);
const tempRoot = document.createElement('div');

const processNewConfig = (oc, conf, cb, parent_conf) =>
{

    currentCells = [];
    populateAllCellsList(conf, currentCells);


    if (currentCells.length > 1) {
        removeReduntantItemGroups(conf); // groups that have only single cell or dont have any cells at all (objPart.cells is empty)
    }

    markPlaceholders(conf);

    // Attach everything to tempRoot
    while (canvasRootNode.firstChild) { tempRoot.appendChild(canvasRootNode.firstChild); }

    gencanvas(oc, conf, cb, parent_conf);

    replacePlaceholdersWithRealCells(conf);
    // Remove everything from tempRoot
    while (tempRoot.firstChild) { tempRoot.removeChild(tempRoot.firstChild); }

    console.log('conf at the end of processNewConfig call =>', conf);


};

const markPlaceholders = (confSlice) => {
    if (confSlice !== null && typeof confSlice === "object") {

        if (confSlice.type === 'cell') {

            const cellIsInsideDom = canvasRootNode.querySelector('#'.concat(confIdToDomId(confSlice.id)));

            if (cellIsInsideDom) {
                confSlice.type = 'cellplaceholder';
                confSlice.id = confSlice.id.concat('_temp');
            }
        }

        if (confSlice.cells) {
            for (let i = 0; i < confSlice.cells.length; i++) {
                markPlaceholders(confSlice.cells[i]);
            }
        }
    } else {
        // do nothing
    }
};

const replacePlaceholdersWithRealCells = (confSlice) => {
    if (confSlice !== null && typeof confSlice === "object") {

        if (confSlice.type === 'cellplaceholder') {

            const originalId = confSlice.id.substring(0, confSlice.id.length - 5);
            const placeholderNode = canvasRootNode.querySelector('#'.concat(confIdToDomId(confSlice.id)));
            const originalNode = tempRoot.querySelector('#'.concat(confIdToDomId(originalId)));

            if (placeholderNode) {

                confSlice.type = 'cell';
                confSlice.id = originalId;

                placeholderNode.parentNode.appendChild(originalNode);
                placeholderNode.parentNode.removeChild(placeholderNode);
            }
        }

        if (confSlice.cells) {
            for (let i = 0; i < confSlice.cells.length; i++) {
                replacePlaceholdersWithRealCells(confSlice.cells[i]);
            }
        }
    } else {
        // do nothing
    }
};


const callGencanvasWithCloneAndMoveActions = (oc, conf, cb, parent_conf) => {
    gencanvas(oc, conf, cb, parent_conf);
    cloneOrMoveCorrespondingCanvasItems(conf);
};

const countAllCells = () => {
    return canvasRootNode.querySelectorAll('div[id^='.concat(CELLS_SELECTOR).concat(']')).length;
};

const populateAllCellsList = (confSlice, cells) => {

    if (confSlice !== null && typeof confSlice === "object") {

        if (confSlice.type === 'cell') {
            cells.push(confSlice);
        }

        if (confSlice.cells) {
            for (let i = 0; i < confSlice.cells.length; i++) {
                populateAllCellsList(confSlice.cells[i], cells);
            }
        }
    } else {
        // do nothing
    }
};

/**
 * Returns conf slice that has provided targetSliceID
 * @param confSlice
 * @param targetSliceId
 * @returns {Object} will all corresponding properties
 */
const getConfigSlice = (confSlice, targetSliceId) => {
    if (confSlice !== null && typeof confSlice === "object") {

        if (confSlice.id === targetSliceId) {
            return confSlice;
        }

        if (confSlice.cells) {
            for (let i = 0; i < confSlice.cells.length; i++) {
                const result = getConfigSlice(confSlice.cells[i], targetSliceId);
                if (result) {
                    return result;
                }
            }
        }
    } else {
        // do nothing
    }
};

/**
 * Returns parent conf slice for provided child slice id
 * @param confSlice
 * @param childSliceId
 * @returns {Object} will all corresponding properties
 */
const getParentConfigSlice = (confSlice, childSliceId) => {
    if (confSlice !== null && typeof confSlice === "object") {

        if (confSlice.cells) {
            for (let i = 0; i < confSlice.cells.length; i++) {
                if (confSlice.cells[i].id === childSliceId) {
                    return confSlice;
                }
                let result = getParentConfigSlice(confSlice.cells[i], childSliceId);
                if (result) {
                    return result;
                }
            }
        }
    } else {
        // do nothing
    }
};

/**
 * Will remove confSlice containing provided id
 * @param confSlice
 * @param idOfConfSliceThatShouldBeRemoved
 * @returns {number} - index at which removed element was residing, undefined if no item has been deleted
 */
const removeConfSliceFromParent = (confSlice, idOfConfSliceThatShouldBeRemoved) => {
    if (confSlice !== null && typeof confSlice === "object") {


        if (confSlice.cells) {
            for (let i = confSlice.cells.length - 1; i >= 0; i--) {

                if (confSlice.cells[i].id === idOfConfSliceThatShouldBeRemoved) {
                    confSlice.cells.splice(i, 1);
                    return i;
                    // TODO testing

                   /* const domId = confIdToDomId(idOfConfSliceThatShouldBeRemoved);
                    const targetCell = canvasRootNode.querySelector('#'.concat(domId));

                    if(!targetCell) {
                        confSlice.cells.splice(i, 1);
                        return i;
                    }

                    if(confSlice.cells[i].type === 'cell') {

                        let firstCellParent = targetCell.parentNode;
                        const firstFirstCellParent = firstCellParent;
                        firstCellParent._oldid = firstCellParent.id;
                        firstCellParent.id = firstCellParent.parentNode.lastElementChild.id;

                        while (firstCellParent.nextElementSibling) {
                            firstCellParent = firstCellParent.nextElementSibling;
                            firstCellParent._oldid = firstCellParent.id;
                            firstCellParent.id = firstCellParent.previousElementSibling._oldid;
                        }
                        // First first cell parent should become last item inside its parent
                        const targetParent = firstFirstCellParent.parentNode;
                        targetParent.removeChild(firstFirstCellParent);
                        targetParent.appendChild(firstFirstCellParent);
                    }

                    confSlice.cells.splice(i, 1);
                    return i;*/
                }
                removeConfSliceFromParent(confSlice.cells[i], idOfConfSliceThatShouldBeRemoved);
            }
        }
    } else {
        // do nothing
    }
};

const getCellIndexInParent = (parentArray, cellOrGroupId) => {
    for (let i = 0; i < parentArray.length; i++) {
        if (parentArray[i].id === cellOrGroupId) {
            return i;
        }
    }
    return parentArray.length;
};


const markAllCellsThatShouldBeMoved = (confSlice) => {
    if (confSlice !== null && typeof confSlice === "object") {

        if (confSlice.type === 'cell') {
            confSlice.originalId = confSlice.id;
            confSlice.id = getTempCellId();
            confSlice.originalSource = confSlice.source;
            confSlice.source = '';
            confSlice.actionType = 'move';
        }

        if (confSlice.cells) {
            for (let i = 0; i < confSlice.cells.length; i++) {
                markAllCellsThatShouldBeMoved(confSlice.cells[i]);
            }
        }
    } else {
        // do nothing
    }
};

// --------------------------------------------------------------
// --------------- TEMP CELL ID GENERATORS ----------------------
// --------------------------------------------------------------

let newCellCount = 0;
function getNewCellId() {
    newCellCount++;
    return 'fgrp1-h2-n' + newCellCount;
}

let tmpCellCount = 0;
function getTempCellId() {
    tmpCellCount++;
    return 'tempCell-n' + tmpCellCount;
}

/**
 * Insert new config into parentConf.cells list (if beforeChildWithID is not, provided new cell config will be appended to the end)
 * @param confSlice
 * @param beforeChildWithID - tells parser before which child element new conf item should reside
 * @param newCellChild - config for new col/row group or for new cell
 */
const insertToConfig = (confSlice, beforeChildWithID, newCellChild) => {
    if (beforeChildWithID) {
        const childIndex = getCellIndexInParent(confSlice.cells, beforeChildWithID);
        confSlice.cells.splice(childIndex, 0, newCellChild);

        // Mark all cells after newly inserted one for moving
        /*for (let i = childIndex + 1; i < confSlice.cells.length; i++) {
            markAllCellsThatShouldBeMoved(confSlice.cells[i]);
        }*/


    } else {
        confSlice.cells.push(newCellChild);
    }
};

const cloneOrMoveCorrespondingCanvasItems = (confSlice) => {
    if (confSlice !== null && typeof confSlice === "object") {

        if (confSlice.originalId) {

            const originalNode = canvasRootNode.querySelector('#'.concat(confIdToDomId(confSlice.originalId)));
            const placeholderNode = canvasRootNode.querySelector('#'.concat(confIdToDomId(confSlice.id)));
            const newParent = placeholderNode.parentNode;

            if (confSlice.actionType === 'move') {

                newParent.appendChild(originalNode);
                newParent.removeChild(placeholderNode);

                confSlice.id = confSlice.originalId;
                confSlice.source = confSlice.originalSource;
                delete confSlice.actionType;
                delete confSlice.originalId;
                delete confSlice.originalSource;

            } else if (confSlice.actionType === 'copy') {

                const clonedNode = originalNode.cloneNode(true);
                clonedNode.id = confIdToDomId(confSlice.id);

                newParent.removeChild(placeholderNode);
                newParent.appendChild(clonedNode);

                confSlice.source = confSlice.originalSource;
                delete confSlice.actionType;
                delete confSlice.originalId;
                delete confSlice.originalSource;
            }
        }

        if (confSlice.cells) {
            for (let i = 0; i < confSlice.cells.length; i++) {
                cloneOrMoveCorrespondingCanvasItems(confSlice.cells[i]);
            }
        }
    } else {
        // do nothing
    }
};

const removeAllItemsOutsideOfConfig = (conf, canvasItemsList) => {

    const allConfIds = [];
    populateAllConfIds(allConfIds, conf);

    console.log('------------------------------------------');
    console.log('--- REMOVE ALL ITEMS OUTSIDE OF CONFIG ---');
    console.log('------------------------------------------');
    console.log(conf);
    console.log(allConfIds);
    console.log(canvasItemsList);


    for (let i = 0; i < canvasItemsList.length; i++) {

        if (!allConfIds.includes(canvasItemsList[i].id)) {

            const canvasItemFirstChild = canvasItemsList[i].firstElementChild;
            let isFirstCellParent = canvasItemFirstChild && canvasItemFirstChild.id && canvasItemFirstChild.id.startsWith(CELLS_SELECTOR);

            const itemIsCell = canvasItemsList[i].id.startsWith(CELLS_SELECTOR);

            console.log('{ itemIsFirstCellParent, itemIsCell }', isFirstCellParent, itemIsCell);


            if (itemIsCell) {// remove that cell and its first parent
                canvasItemsList[i].parentNode.parentNode.removeChild(canvasItemsList[i].parentNode);
            } else if (!isFirstCellParent) {
                canvasItemsList[i].parentNode.removeChild(canvasItemsList[i]);
            }
        }
    }
};

const populateAllConfIds = (allConfIds, confSlice) => {
    if (confSlice !== null && typeof confSlice === "object" ) {

        allConfIds.push(confIdToDomId(confSlice.id));

        if (confSlice.cells) {
            for (let i = 0; i < confSlice.cells.length; i++) {
                populateAllConfIds(allConfIds, confSlice.cells[i]);
            }
        }
    } else {
        // do nothing
    }
};

const confIdToDomId = (confId) => {
    if (confId === '') {
        return CANVAS_ROOT_ID;
    } else {
        return CANVAS_ROOT_ID.concat('-').concat(confId);
    }
};

const domIdToConfId = (domId) => {
    const idArray = domId.split('-');
    if (!idArray[1]) { return '';}

    idArray.splice(0,1);
    return idArray.join('-');
};


const traverseAndPopulateParentNodes = (confSlice, sliceParent) => {

    if (confSlice !== null && typeof confSlice === "object" ) {

        confSlice.parentNode = sliceParent;

        if (confSlice.cells) {
            for (let i = 0; i < confSlice.cells.length; i++) {
                traverseAndPopulateParentNodes(confSlice.cells[i], confSlice);
            }
        }
    } else {
        // do nothing
    }

};

const traverseAndRemoveParentNodes = (confSlice) => {

    if (confSlice !== null && typeof confSlice === "object" ) {

        delete confSlice.parentNode;

        if (confSlice.cells) {
            for (let i = 0; i < confSlice.cells.length; i++) {
                traverseAndRemoveParentNodes(confSlice.cells[i]);
            }
        }
    } else {
        // do nothing
    }

};

/**
 * Remove groups which either have only single cell
 * (move that cell directly to next parent) or that don't have any cells remaining
 */
const traverseAndRemoveUnneccessaryGroups = (confSlice, parentCellArray, cellIndex, parentConfSlice) => {

    if (confSlice !== null && typeof confSlice === "object") {

        if (confSlice.type !== 'cell' && (!confSlice.cells || confSlice.cells.length === 0)) {
            // Just delete this item
            parentCellArray.splice(cellIndex, 1);
        } else if (confSlice.type !== 'cell' && confSlice.cells && confSlice.cells.length === 1 && confSlice.cells[0].type === 'cell') {
            // Move this item one position up and mark cell that should be moved to new parent
            parentCellArray.splice(cellIndex, 1, confSlice.cells[0]);
            //markAllCellsThatShouldBeMoved(confSlice.cells[0]);
            traverseAndRemoveUnneccessaryGroups(parentConfSlice, parentConfSlice.parentNode?.cells, 0, parentConfSlice.parentNode);
        } else if (confSlice.cells) {
            for (let i = confSlice.cells.length - 1; i >= 0; i--) {
                traverseAndRemoveUnneccessaryGroups(confSlice.cells[i], confSlice.cells, i, confSlice);
            }
        }
    } else {
        // do nothing
    }

};


/**
 * Cleanup config so there aren't any unwanted groups left
 */
const removeReduntantItemGroups = (conf) =>
{
    traverseAndPopulateParentNodes(conf, null);
    traverseAndRemoveUnneccessaryGroups(conf, null, null, null);
    traverseAndRemoveParentNodes(conf);
};



const gencanvas = (oc, conf, cb, parent_conf) =>
{
    if (typeof oc == 'string')
        oc = document.getElementById(oc);

    conf.id = parent_conf ? oc.id.substr(oc.id.lastIndexOf('-') + 1) : '';

    // oc.style.display = parent_conf ? 'flex' : 'inline-flex';
    oc.style.display = 'flex';

    if (conf.type != 'row' && conf.type != 'column')
        conf.type = 'row';

    oc.style.flexDirection = conf.type;

    const id_pfx = oc.id.concat(parent_conf ? '' : '-', conf.type == 'row' ? 'c' : 'r');

    if (typeof parent_conf != 'object')
        parent_conf = {};

    // wrap
    if (!('wrap' in conf) && conf.inherit !== false)
        conf.wrap = parent_conf.wrap;

    oc.style.flexWrap = conf.wrap ? 'wrap' : 'nowrap';

    // hgap
    if (!('hgap' in conf) && conf.inherit !== false)
        conf.hgap = parent_conf.hgap;

    if (conf.hgap)
        oc.style.columnGap = typeof conf.hgap == 'number' ? ''.concat(conf.hgap, 'px') : conf.hgap;

    // vgap
    if (!('vgap' in conf) && conf.inherit !== false)
        conf.vgap = parent_conf.vgap;

    if (conf.vgap)
        oc.style.rowGap = typeof conf.vgap == 'number' ? ''.concat(conf.vgap, 'px') : conf.vgap;

    // align
    if (!('align' in conf) && conf.inherit !== false)
        conf.align = parent_conf.align;

    if (conf.align)
        oc.style.alignItems = conf.align;

    // wrapAlign
    if (!('wrapAlign' in conf) && conf.inherit !== false)
        conf.wrapAlign = parent_conf.wrapAlign;

    if (conf.wrapAlign)
        oc.style.alignContent = conf.wrapAlign;

    // justify
    if (!('justify' in conf) && conf.inherit !== false)
        conf.justify = parent_conf.justify;

    if (conf.justify)
        oc.style.justifyContent = conf.justify;

    // grow
    if (!('grow' in conf) && conf.inherit !== false)
        conf.grow = parent_conf.grow;

    if (conf.grow)
        oc.style.flexGrow = 1;

    // shrink
    if (!('shrink' in conf) && conf.inherit !== false)
        conf.shrink = parent_conf.shrink;

    if (conf.shrink)
        oc.style.flexShrink = 1;

    // sub
    for (let i = 0, len = conf.cells.length; i < len; ++i)
    {
        const ic_id = id_pfx.concat(i);

        let ic = oc.querySelector('#'.concat(ic_id));

        if (!ic)
        {
            ic = document.createElement('div');
            ic.id = ic_id;

            oc.appendChild(ic);

            if (cb)
                cb(ic);
        }

        if (conf.cells[i].type == 'cellplaceholder')
            genplaceholder(ic, conf.cells[i], cb, conf);
        else if (conf.cells[i].type == 'cell')
            gentext(ic, conf.cells[i], cb, conf);
        else
            gencanvas(ic, conf.cells[i], cb, conf);
    }
};

const genplaceholder = (oc, conf, cb, parent_conf) =>
{
    if (typeof oc == 'string')
        oc = document.getElementById(oc);

    const ic_id = oc.id.substr(0, oc.id.lastIndexOf('-') + 1).concat(conf.id);

    let ic = oc.querySelector('#'.concat(ic_id));

    if (!ic)
    {
        ic = document.createElement('div');
        ic.id = ic_id;

        oc.appendChild(ic);

    }


    // grow
    if (!('grow' in conf) && conf.inherit !== false)
        conf.grow = parent_conf.grow;

    if (conf.grow)
        oc.style.flexGrow = 1;

    // shrink
    if (!('shrink' in conf) && conf.inherit !== false)
        conf.shrink = parent_conf.shrink;

    if (conf.shrink)
        oc.style.flexShrink = 1;

};

const gentext = (oc, conf, cb, parent_conf) =>
{
    if (typeof oc == 'string')
        oc = document.getElementById(oc);

    const ic_id = oc.id.substr(0, oc.id.lastIndexOf('-') + 1).concat(conf.id);

    let ic = oc.querySelector('#'.concat(ic_id));

    if (!ic)
    {
        ic = document.createElement('div');
        ic.id = ic_id;

        oc.appendChild(ic);

        if (cb)
            cb(ic);
    }

    if (conf.fgcolor)
        ic.style.color = conf.fgcolor;

    if (conf.bgcolor)
        ic.style.backgroundColor = conf.bgcolor;

    if (conf.border)
        ic.style.border = conf.border;

    ic.style.padding = '5px';
    ic.style.fontFamily = 'Arial';
    ic.style.textAlign = 'left';

    ic.style.width = ''.concat(conf.width, 'px');

    let i = 0;

    do
    {
        const txt = ic.innerText;

        ic.innerText += ' '.concat(_text[i++]);

        if (ic.scrollHeight >= conf.height)
        {
            ic.innerText = txt;

            break;
        }
    }
    while (true);

    ic.style.height = ''.concat(conf.height, 'px');

    // grow
    if (!('grow' in conf) && conf.inherit !== false)
        conf.grow = parent_conf.grow;

    if (conf.grow)
        oc.style.flexGrow = 1;

    // shrink
    if (!('shrink' in conf) && conf.inherit !== false)
        conf.shrink = parent_conf.shrink;

    if (conf.shrink)
        oc.style.flexShrink = 1;

    // scale
    let scale = parseFloat(oc.clientWidth) / parseFloat(ic.offsetWidth);

    //console.log(scale, oc.clientWidth, ic.offsetWidth);

    if (scale != 1.0)
    {
        //ic.style.transformOrigin = 'top left';
        //ic.style.transform = 'scale('.concat(scale, ')');
    }

    //oc.style.height = ''.concat(parseFloat(ic.offsetHeight) * scale, 'px');
};

const _text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Dictumst vestibulum rhoncus est pellentesque. Eget gravida cum sociis natoque. Ultricies lacus sed turpis tincidunt id aliquet. Rutrum quisque non tellus orci ac auctor augue. Tortor posuere ac ut consequat. Eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque. Ut pharetra sit amet aliquam id diam maecenas. Quis commodo odio aenean sed. Lobortis scelerisque fermentum dui faucibus in. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Odio morbi quis commodo odio aenean sed adipiscing. Tellus rutrum tellus pellentesque eu tincidunt tortor aliquam nulla.

Mauris rhoncus aenean vel elit scelerisque mauris pellentesque. Nascetur ridiculus mus mauris vitae ultricies leo integer malesuada. Maecenas ultricies mi eget mauris pharetra et ultrices. Ipsum nunc aliquet bibendum enim facilisis gravida. Id eu nisl nunc mi ipsum faucibus. Gravida in fermentum et sollicitudin ac orci phasellus. Pellentesque id nibh tortor id aliquet lectus proin nibh. Sagittis id consectetur purus ut faucibus pulvinar elementum integer. Morbi tincidunt ornare massa eget egestas purus viverra accumsan. Euismod nisi porta lorem mollis aliquam ut porttitor. Pharetra magna ac placerat vestibulum lectus mauris ultrices. Amet purus gravida quis blandit turpis cursus in hac. Auctor eu augue ut lectus arcu bibendum at varius vel. Sed blandit libero volutpat sed cras ornare arcu dui. Lorem donec massa sapien faucibus et molestie ac feugiat sed. Sem nulla pharetra diam sit amet nisl suscipit adipiscing bibendum. Metus dictum at tempor commodo ullamcorper. Dapibus ultrices in iaculis nunc sed augue lacus viverra vitae.

Viverra accumsan in nisl nisi scelerisque. Phasellus egestas tellus rutrum tellus pellentesque eu tincidunt tortor. Auctor eu augue ut lectus arcu bibendum at. Eget lorem dolor sed viverra ipsum. Aenean vel elit scelerisque mauris. Cras fermentum odio eu feugiat pretium nibh ipsum consequat. Venenatis lectus magna fringilla urna porttitor rhoncus dolor purus. Mauris rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar pellentesque. Pharetra pharetra massa massa ultricies mi. Dui sapien eget mi proin sed libero enim sed. Aliquam sem fringilla ut morbi tincidunt. Aliquet sagittis id consectetur purus ut faucibus. Nisi vitae suscipit tellus mauris a diam maecenas sed.

Scelerisque eleifend donec pretium vulputate sapien nec. Porta non pulvinar neque laoreet suspendisse interdum consectetur libero. Morbi leo urna molestie at elementum eu facilisis. Vestibulum sed arcu non odio euismod lacinia at quis risus. Sit amet consectetur adipiscing elit duis tristique. Sagittis vitae et leo duis ut diam. Turpis cursus in hac habitasse platea dictumst quisque. Amet est placerat in egestas erat imperdiet sed. Risus pretium quam vulputate dignissim suspendisse in. Nulla facilisi cras fermentum odio eu. Accumsan sit amet nulla facilisi morbi tempus iaculis.

Neque vitae tempus quam pellentesque nec nam aliquam sem. Lectus proin nibh nisl condimentum id. Tincidunt tortor aliquam nulla facilisi cras fermentum odio eu feugiat. Felis eget velit aliquet sagittis. A arcu cursus vitae congue mauris. Risus quis varius quam quisque id. Et ligula ullamcorper malesuada proin libero. Cursus risus at ultrices mi tempus. Odio tempor orci dapibus ultrices. Ut diam quam nulla porttitor massa id.

Porttitor leo a diam sollicitudin tempor id eu nisl. Duis ultricies lacus sed turpis tincidunt id aliquet. At tempor commodo ullamcorper a lacus vestibulum sed arcu. Accumsan sit amet nulla facilisi morbi tempus iaculis. Lectus quam id leo in vitae. Consequat nisl vel pretium lectus quam id leo in. Euismod nisi porta lorem mollis aliquam. Mus mauris vitae ultricies leo integer. Enim sed faucibus turpis in. Senectus et netus et malesuada fames ac turpis egestas integer. In fermentum posuere urna nec tincidunt. Morbi enim nunc faucibus a pellentesque sit amet porttitor. Ultrices eros in cursus turpis massa.

Est lorem ipsum dolor sit. Amet nisl purus in mollis nunc sed id semper risus. Odio pellentesque diam volutpat commodo sed. Scelerisque varius morbi enim nunc. Vel eros donec ac odio tempor orci. Dolor purus non enim praesent elementum facilisis. A scelerisque purus semper eget duis at. Eget aliquet nibh praesent tristique. Vitae tempus quam pellentesque nec nam aliquam sem et tortor. In eu mi bibendum neque egestas congue.

Nunc scelerisque viverra mauris in aliquam sem fringilla. Ac turpis egestas integer eget aliquet nibh praesent tristique. Sed viverra ipsum nunc aliquet bibendum. Donec pretium vulputate sapien nec sagittis aliquam. A erat nam at lectus urna. Turpis egestas maecenas pharetra convallis posuere morbi leo urna. Est lorem ipsum dolor sit amet consectetur adipiscing elit pellentesque. Dui id ornare arcu odio ut. Vel pharetra vel turpis nunc eget lorem dolor. Risus nullam eget felis eget nunc. Habitasse platea dictumst quisque sagittis purus sit. Ac ut consequat semper viverra nam libero justo laoreet. Quis risus sed vulputate odio ut enim blandit volutpat maecenas. Tristique risus nec feugiat in. Dui accumsan sit amet nulla facilisi morbi tempus. Est placerat in egestas erat imperdiet sed euismod nisi porta. Quisque sagittis purus sit amet volutpat consequat mauris nunc. Sagittis orci a scelerisque purus.

Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Facilisi nullam vehicula ipsum a arcu. Urna porttitor rhoncus dolor purus non. Egestas quis ipsum suspendisse ultrices gravida dictum fusce ut placerat. A iaculis at erat pellentesque adipiscing commodo elit at imperdiet. Et malesuada fames ac turpis egestas integer eget. Phasellus egestas tellus rutrum tellus pellentesque. Pharetra vel turpis nunc eget lorem dolor sed viverra. In nisl nisi scelerisque eu ultrices. Ipsum dolor sit amet consectetur adipiscing elit duis.

Accumsan tortor posuere ac ut. Volutpat consequat mauris nunc congue nisi vitae suscipit tellus mauris. Turpis nunc eget lorem dolor sed viverra ipsum nunc aliquet. Commodo odio aenean sed adipiscing diam. Nisl nunc mi ipsum faucibus vitae. Nunc aliquet bibendum enim facilisis gravida. Vulputate odio ut enim blandit volutpat maecenas volutpat blandit. Volutpat diam ut venenatis tellus in metus vulputate eu scelerisque. Ultrices neque ornare aenean euismod elementum nisi quis eleifend. Lobortis mattis aliquam faucibus purus. Ut pharetra sit amet aliquam id diam. Sit amet tellus cras adipiscing enim eu. Posuere sollicitudin aliquam ultrices sagittis.`.split(/\s+/);

