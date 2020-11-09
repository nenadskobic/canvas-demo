Ext.onReady(function () {

    let tPanel = Ext.create('Ext.tab.Panel', {
        renderTo: 'ribbonSimple',
        width: '100%',
        items: [{
            xtype: 'panel',
            title: 'Canvas',
            tbar: Ext.create('Ext.toolbar.Toolbar', {
                defaults: {focusCls: '', headerPosition: 'bottom'},
                items: [{
                    xtype: 'buttongroup',
                    columns: 3,
                    height: 48,
                    defaults: {focusCls: '', xtype: 'button'},
                    items: [{text: 'Save as', height: 32}, {text: 'Close', height: 32}]
                }, {
                    xtype: 'buttongroup',
                    columns: 3,
                    height: 48,
                    defaults: {focusCls: '', xtype: 'button'},
                    items: [{text: 'Report', cls: 'reportBtn', focusCls: '', height: 32}]
                }, '->',
                    {
                    xtype: 'button',
                    text: 'Show frame groups',
                    enableToggle: true,
                    hidden: true,
                    listeners: {
                        toggle: function(thisCmp, state) {

                            let groups = document.querySelectorAll('.row-group, .col-group');

                            let randoms = [];
                            for (let i = 0; i < groups.length; i++) {
                                let groupTargets = groups[i].querySelectorAll('.frame');
                                if (state) {
                                    let nextR = Math.floor(Math.random()*18);
                                    let nOfIterations = 0;
                                    while (randoms.includes(nextR)) {
                                        nextR = Math.floor(Math.random()*18);
                                        ++nOfIterations;
                                        if (nOfIterations > 18) {
                                            randoms = [];
                                        }
                                    }
                                    randoms.push(nextR);
                                    let lightColor='hsl('+nextR*20+',80%,85%)';
                                    for (let j = 0; j < groupTargets.length; j++) {
                                        groupTargets[j].style.background = lightColor;
                                    }
                                } else {
                                    for (let j = 0; j < groupTargets.length; j++) {
                                        groupTargets[j].style.background = '#ffff';
                                    }
                                }
                            }

                        }
                    }
                }, {
                        xtype: 'button',
                        text: 'Switch to group selection',
                        enableToggle: true,
                        listeners: {
                            toggle: function(thisCmp, state) {
                                const groups = [];
                                const potentialGroups = document.querySelectorAll('div[id^='.concat(CANVAS_ROOT_ID).concat(']'));

                                for (let i = 0; i < potentialGroups.length; i++) {
                                    if (potentialGroups[i].style.display === 'flex' || potentialGroups[i].style.display === 'inline-flex') {
                                        groups.push(potentialGroups[i]);
                                    }
                                }


                                let randoms = [];
                                for (let i = 0; i < groups.length; i++) {
                                    let nextR = Math.floor(Math.random()*18);
                                    let nOfIterations = 0;
                                    while (randoms.includes(nextR)) {
                                        nextR = Math.floor(Math.random()*18);
                                        ++nOfIterations;
                                        if (nOfIterations > 18) {
                                            randoms = [];
                                        }
                                    }
                                    randoms.push(nextR);
                                    let lightColor='hsl('+nextR*20+',80%,85%)';
                                    if (state) {
                                        groups[i].style.padding = '8px';
                                        groups[i].style.border = '1px dashed black';
                                        //groups[i].style.background = lightColor;
                                        let children = groups[i].querySelectorAll('.frame');
                                        for (let j = 0; j < children.length; j++) {
                                            children[j].style.background = '#fff';
                                        }
                                    } else {
                                        groups[i].style.padding = 0;
                                        groups[i].style.border =  0;
                                        groups[i].style.background = '#ffff';
                                    }
                                }
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        text: 'Ctrl + click => Multiselekcija, Delete => Brisanje, Drag => Premjestanje, Alt + Drag => Kopiranje'
                    },
                    {
                        xtype: 'numberfield',
                        width: 120,
                        fieldLabel: 'Gap size',
                        labelWidth: 60,
                        value: 12,
                        listeners: {
                            change: function(cmp, newValue) {
                                let groups = document.querySelectorAll('.row-group, .col-group');
                                for (let i = 0; i < groups.length; i++) {
                                    groups[i].style.gap = newValue+'px';
                                }
                            }
                        }
                    }]
            })
        }, {title: 'Second Tab', disabled: true}]
    });

    //--------------------------------- End of Ext toolbar rendering


    //--------------------------------- Set initial config value

    const TARGET_ZONE_BLUE = '#0ba5e31f';
    const TARGET_ZONE_GREEN = '#12e39819';
    const UNDERLAY_BLUE = '#0ba5e3';
    const UNDERLAY_GREEN = '#12e398';

    const DD_WIDTH = 14, DD_HEIGHT = 14;

    let conf = {
        type: 'row',
        hgap: 5,
        vgap: 5,
        cells: [
            {
                type: 'cell',
                height: 120,
                width: 400,
                id: getNewCellId(),
                fgcolor: '#555',
                border: '1px solid red'
            },
            {
                type: 'cell',
                height: 120,
                width: 400,
                id: getNewCellId(),
                fgcolor: '#222',
                border: '1px solid black'
            }
        ]
    };

/*
    setTimeout(function() {
        conf.cells.splice(0,1);
        console.log('conf without second items',conf);
        gencanvas(CANVAS_ROOT_ID, conf, onCreateCellCb);
        console.log(conf);
    }, 1800);*/

    const creationCount = {};

    window.creationCount = creationCount;

    const onCreateCellCb = (el) => {

        if (el.id.startsWith(CELLS_SELECTOR)) { // Cell node (add corresponding listeners and make it draggable)

            if (!creationCount[el.id]) {
                creationCount[el.id] = 1;
            } else {
                creationCount[el.id] = creationCount[el.id] + 1;
            }
            console.log('creationCount: ', creationCount);

            el.draggable = true;
            el.addEventListener('dragstart', cellOnDragStart);
            el.addEventListener('dragend', cellOnDragEnd);
            el.addEventListener('click', cellOnClick);

            // Prevent text selection and set pointer cursor
            el.style['-webkit-user-select'] = 'none';
            el.style['-moz-user-select'] = 'none';
            el.style['-ms-user-select'] = 'none';
            el.style['user-select'] = 'none';
            el.style.cursor = 'pointer';
        }

    };

    const configUpdated = () => {
        processNewConfig(CANVAS_ROOT_ID, conf, onCreateCellCb);
        canvasParent = document.getElementById(CANVAS_ROOT_ID);
        canvasParent.addEventListener('dragover', canvasOnDragOver);
    };

    const setCellListeners = (node) => {
        node.addEventListener('dragstart', cellOnDragStart);
        node.addEventListener('dragend', cellOnDragEnd);
        node.addEventListener('click', cellOnClick);
    };

    gencanvas(CANVAS_ROOT_ID, conf, onCreateCellCb);



    let btnContainer = tPanel.down('[text=Report]').container;
    btnContainer.set({ draggable: 'true' });


    // Drag and drop data
    let dragDataList = [];
    let dragSource = {}; // { type: 'Cell'||'Button', selectionSize: 1+ }


    /**
     * Add, clone or move selected items
     * @param dropAction - either add (when item is being dragged from inspector or ribbon),
     * move or copy (when frames are being moved around with or without alt key)
     */
    const injectSelection = function(dropAction) {

        let targetEl = lastDragData.target.el; // target el can be either col/row flexbox or cell (or cell first parent)
        let direction = lastDragData.target.direction; // one of the following values: 'top','left','bottom','right'
        let referencedChildNode = lastDragData.target.before;

        //---------------------------------------------------------------------------------------------
        // Adjust targetEl and referencedChildNode to either be col/row flexbox or direct cell (id of
        // cell first parent is not present in conf obj so we have no use of it if it becomes targetEl)
        //---------------------------------------------------------------------------------------------
        if (!getConfigSlice(conf, domIdToConfId(targetEl.id))) {
            targetEl = targetEl.firstElementChild;
        }
        if (referencedChildNode && !getConfigSlice(conf, domIdToConfId(referencedChildNode.id))) {
            referencedChildNode = referencedChildNode.firstElementChild;
        }

        const targetElConfSlice = getConfigSlice(conf, domIdToConfId(targetEl.id));

        console.log('direction and target');
        console.log(targetEl);
        console.log(direction);

        let dragType = 'InBetween';

        if (targetElConfSlice.type === 'cell') {
            dragType = 'SplitCell';
        }
        else if (
            (targetElConfSlice.type === 'column' && (direction === 'left' || direction === 'right')) ||
            (targetElConfSlice.type === 'row' && (direction === 'top' || direction === 'bottom')))
        {
            dragType = 'NewDirection';
        }
        else if (!referencedChildNode &&
            (
                (targetElConfSlice.type === 'column' && direction === 'top') ||
                (targetElConfSlice.type === 'row' && direction === 'left')
            )
        ) {
            dragType = 'AtGroupStart';
        }
        else if (!referencedChildNode &&
            (
                (targetElConfSlice.type === 'column' && direction === 'bottom') ||
                (targetElConfSlice.type === 'row' && direction === 'right')
            )
        ) {
            dragType = 'AtGroupEnd';
        }

        if (dragType === 'AtGroupStart' || dragType === 'AtGroupEnd') {

            const parentConfSlice = getConfigSlice(conf, domIdToConfId(targetEl.id));

            let beforeChildWithID = null;

            if (dragType === 'AtGroupStart') {
                let firstElemChild = targetEl.firstElementChild;
                let isCellFirstParent = firstElemChild.firstElementChild && firstElemChild.firstElementChild.id && firstElemChild.firstElementChild.id.startsWith(CELLS_SELECTOR);
                beforeChildWithID = isCellFirstParent ? domIdToConfId(firstElemChild.firstElementChild.id) : domIdToConfId(firstElemChild.id);
            }
            //const beforeChildWithID = dragType === 'AtGroupStart' ? domIdToConfId(targetEl.firstElementChild.id) : null;

            for (let i = 0; i < dragSource.selectionSize; i++) {

                if (dropAction === 'move' || dropAction === 'copy') {
                    const originalId = domIdToConfId(cellSelection[i].id);
                    const originalConfSlice = getConfigSlice(conf, originalId);

                    const newCellChild = {};
                    for (let k in originalConfSlice) {
                        if (originalConfSlice.hasOwnProperty(k)) {
                            newCellChild[k] = originalConfSlice[k];
                        }
                    }

                    if (dropAction === 'move') {
                        removeConfSliceFromParent(conf, originalId)
                    } else if (dropAction === 'copy') {
                        newCellChild.id = getNewCellId();

                        const originalNode = canvasParent.querySelector('#'.concat(confIdToDomId(originalId)));
                        const copiedNode = originalNode.cloneNode(true);
                        setCellListeners(copiedNode);

                        copiedNode.id = confIdToDomId(newCellChild.id);
                        originalNode.parentNode.appendChild(copiedNode);
                    }
                    insertToConfig(parentConfSlice, beforeChildWithID, newCellChild);
                } else {
                    const newCellChild = { type: 'cell', id: getNewCellId(), source: dragSource.source, width: 400, height: 120, border: '1px solid' };
                    insertToConfig(parentConfSlice, beforeChildWithID, newCellChild);
                }
            }
            configUpdated();

        } else if (dragType === 'InBetween') {

            const parentConfSlice = getConfigSlice(conf, domIdToConfId(targetEl.id));
            const beforeChildWithID = referencedChildNode ? domIdToConfId(referencedChildNode.id) : null;

            for (let i = 0; i < dragSource.selectionSize; i++) {

                if (dropAction === 'move' || dropAction === 'copy') {
                    const originalId = domIdToConfId(cellSelection[i].id);
                    const originalConfSlice = getConfigSlice(conf, originalId);

                    const newCellChild = {};
                    for (let k in originalConfSlice) {
                        if (originalConfSlice.hasOwnProperty(k)) {
                            newCellChild[k] = originalConfSlice[k];
                        }
                    }

                    if (dropAction === 'move') {
                        removeConfSliceFromParent(conf, originalId)
                    } else if (dropAction === 'copy') {
                        newCellChild.id = getNewCellId();

                        const originalNode = canvasParent.querySelector('#'.concat(confIdToDomId(originalId)));
                        const copiedNode = originalNode.cloneNode(true);
                        setCellListeners(copiedNode);

                        copiedNode.id = confIdToDomId(newCellChild.id);
                        originalNode.parentNode.appendChild(copiedNode);
                    }
                    insertToConfig(parentConfSlice, beforeChildWithID, newCellChild);
                } else {
                    const newCellChild = { type: 'cell', id: getNewCellId(), source: dragSource.source, width: 400, height: 120, border: '1px solid' };
                    insertToConfig(parentConfSlice, beforeChildWithID, newCellChild);
                }
            }
            configUpdated();

        } else if (dragType === 'NewDirection') {

            const parentConfSlice = getConfigSlice(conf, domIdToConfId(targetEl.id));
            let innerGroup;

            if (parentConfSlice.type === 'column') {
                parentConfSlice.type = 'row';
                innerGroup = {type: 'column', cells: parentConfSlice.cells.splice(0, parentConfSlice.cells.length)};
                parentConfSlice.cells = [innerGroup];

            } else if (parentConfSlice.type === 'row') {
                parentConfSlice.type = 'column';
                innerGroup = {type: 'row', cells: parentConfSlice.cells.splice(0, parentConfSlice.cells.length)};
                parentConfSlice.cells = [innerGroup];
            }

            for (let i = 0; i < dragSource.selectionSize; i++) {

                let newCellChild;
                if (dropAction === 'move' || dropAction === 'copy') {
                    const originalId = domIdToConfId(cellSelection[i].id);
                    const originalConfSlice = getConfigSlice(conf, originalId);

                    newCellChild = {};
                    for (let k in originalConfSlice) {
                        if (originalConfSlice.hasOwnProperty(k)) {
                            newCellChild[k] = originalConfSlice[k];
                        }
                    }
                    if (dropAction === 'move') {
                        removeConfSliceFromParent(conf, originalId)
                    } else if (dropAction === 'copy') {
                        newCellChild.id = getNewCellId();

                        const originalNode = canvasParent.querySelector('#'.concat(confIdToDomId(originalId)));
                        const copiedNode = originalNode.cloneNode(true);
                        setCellListeners(copiedNode);

                        copiedNode.id = confIdToDomId(newCellChild.id);
                        originalNode.parentNode.appendChild(copiedNode);
                    }
                } else {
                    newCellChild = { type: 'cell', id: getNewCellId(), source: dragSource.source, width: 400, height: 120, border: '1px solid' };
                }

                if (direction === 'top' || direction === 'left') {
                    // Add new cell conf before last item inside parentConfSlice.cells
                    parentConfSlice.cells.splice(parentConfSlice.cells.length - 1, 0, newCellChild);
                } else {
                    // Add new cell conf at the end of parentConfSlice.cells
                    parentConfSlice.cells.push(newCellChild);
                }
            }
            configUpdated();


        } else if (dragType === 'SplitCell') {

            if (direction === 'left' || direction === 'right') {

                const parentConfSlice = getParentConfigSlice(conf, domIdToConfId(targetEl.id));
                let cellIndex = 0;
                for (let i = 0; i < parentConfSlice.cells.length; i++) {
                    if (parentConfSlice.cells[i].id === domIdToConfId(targetEl.id)) {
                        cellIndex = i;
                        break;
                    }
                }

                const newGroup = {type: 'row', cells: parentConfSlice.cells.splice(cellIndex, 1)};
                parentConfSlice.cells.splice(cellIndex, 0, newGroup);

                for (let i = 0; i < dragSource.selectionSize; i++) {

                    let newCellChild;
                    if (dropAction === 'move' || dropAction === 'copy') {
                        const originalId = domIdToConfId(cellSelection[i].id);
                        const originalConfSlice = getConfigSlice(conf, originalId);

                        newCellChild = {};
                        for (let k in originalConfSlice) {
                            if (originalConfSlice.hasOwnProperty(k)) {
                                newCellChild[k] = originalConfSlice[k];
                            }
                        }

                        if (dropAction === 'move') {
                            removeConfSliceFromParent(conf, originalId);
                        } else if (dropAction === 'copy') {
                            newCellChild.id = getNewCellId();

                            const originalNode = canvasParent.querySelector('#'.concat(confIdToDomId(originalId)));
                            const copiedNode = originalNode.cloneNode(true);
                            setCellListeners(copiedNode);

                            copiedNode.id = confIdToDomId(newCellChild.id);
                            originalNode.parentNode.appendChild(copiedNode);
                        }
                    } else {
                        newCellChild = { type: 'cell', id: getNewCellId(), source: dragSource.source, width: 400, height: 120, border: '1px solid' };
                    }

                    if (direction === 'left') {
                        // Add new cell conf before last item inside parentConfSlice.cells
                        newGroup.cells.splice(newGroup.cells.length - 1, 0, newCellChild);
                    } else {
                        // Add new cell conf at the end of parentConfSlice.cells
                        newGroup.cells.push(newCellChild);
                    }
                }
                configUpdated();

            } else {

                const parentConfSlice = getParentConfigSlice(conf, domIdToConfId(targetEl.id));
                let cellIndex = 0;
                for (let i = 0; i < parentConfSlice.cells.length; i++) {
                    if (parentConfSlice.cells[i].id === domIdToConfId(targetEl.id)) {
                        cellIndex = i;
                        break;
                    }
                }

                const newGroup = {type: 'column', cells: parentConfSlice.cells.splice(cellIndex, 1)};
                parentConfSlice.cells.splice(cellIndex, 0, newGroup);

                for (let i = 0; i < dragSource.selectionSize; i++) {

                    let newCellChild;
                    if (dropAction === 'move' || dropAction === 'copy') {
                        const originalId = domIdToConfId(cellSelection[i].id);
                        const originalConfSlice = getConfigSlice(conf, originalId);

                        newCellChild = {};
                        for (let k in originalConfSlice) {
                            if (originalConfSlice.hasOwnProperty(k)) {
                                newCellChild[k] = originalConfSlice[k];
                            }
                        }

                        if (dropAction === 'move') {
                            removeConfSliceFromParent(conf, originalId);
                        } else if (dropAction === 'copy') {
                            newCellChild.id = getNewCellId();

                            const originalNode = canvasParent.querySelector('#'.concat(confIdToDomId(originalId)));
                            const copiedNode = originalNode.cloneNode(true);
                            setCellListeners(copiedNode);

                            copiedNode.id = confIdToDomId(newCellChild.id);
                            originalNode.parentNode.appendChild(copiedNode);
                        }
                    } else {
                        newCellChild = { type: 'cell', id: getNewCellId(), source: dragSource.source, width: 400, height: 120, border: '1px solid' };
                    }

                    if (direction === 'top') {
                        // Add new cell conf before last item inside parentConfSlice.cells
                        newGroup.cells.splice(newGroup.cells.length - 1, 0, newCellChild);
                    } else {
                        // Add new cell conf at the end of parentConfSlice.cells
                        newGroup.cells.push(newCellChild);
                    }
                }
                configUpdated();
            }
        }
    };

    const processValidDrop = function(e) {

        if (dragSource.type === 'Button') { // new item added via ribbon / inspector drop
            injectSelection('add');
        } else { // new item(s) are either moved or copied (depending on whether alt key is being pressed)
            const action = e.altKey ? 'copy' : 'move';
            injectSelection(action);
        }

        cellSelection = [];

        const selectedCells = document.querySelectorAll('.cell-selected');

        for (let i = 0; i < selectedCells.length; i++) {
            selectedCells[i].classList.remove('cell-selected');
        }

    };



    let ddTargetUnderlay = document.querySelector('.dd-target-underlay');

    function ddTargetOnDragOver(e) {

        if(e.preventDefault) {
            e.preventDefault();
        }

         // Targeting step by step
        let totalSteps = 0;
        let thisRect = this.getBoundingClientRect();

        switch (currentDragTargetData.directions[0]) {
            case 'top':
            case 'bottom':
                totalSteps = Math.floor(Math.abs(e.clientY - thisRect.top) / currentDragTargetData.stepSize);
                break;
            case 'left':
            case 'right':
                totalSteps = Math.floor(Math.abs(e.clientX - thisRect.left) / currentDragTargetData.stepSize);
                break;
        }


        let targetIndex = totalSteps, dragData;

        if (!dragDataList[0]) {
            return;
        }

        if (dragDataList[0].target.direction === 'top' || dragDataList[0].target.direction === 'left') {
            dragData = getDragDataOnReversedIndex(targetIndex);
        } else {
            dragData = getDragDataOnNormalIndex(targetIndex);
        }
        lastDragData = dragData;

        if (dragData && dragData.target) {
            let targetRect = dragData.target.el.getBoundingClientRect();


            switch (dragDataList[0].target.direction) {
                case 'top':
                case 'bottom':

                    let maxTop = thisRect.bottom - DD_HEIGHT;
                    let calculatedTop = thisRect.top + totalSteps * currentDragTargetData.stepSize;

                    ddTargetUnderlay.style.top = calculatedTop < maxTop ? calculatedTop : maxTop;
                    ddTargetUnderlay.style.left = targetRect.left;
                    ddTargetUnderlay.style.width = targetRect.right - targetRect.left;
                    ddTargetUnderlay.style.height = DD_HEIGHT;
                    break;
                case 'right':
                case 'left':

                    let maxLeft = thisRect.right - DD_WIDTH;
                    let calculatedLeft = thisRect.left + totalSteps * currentDragTargetData.stepSize;

                    ddTargetUnderlay.style.top = targetRect.top;
                    ddTargetUnderlay.style.left = calculatedLeft < maxLeft ? calculatedLeft : maxLeft;
                    ddTargetUnderlay.style.width = DD_WIDTH;
                    ddTargetUnderlay.style.height = targetRect.bottom - targetRect.top;
                    break;
                default:
                    break;
            }

            ddZone.style.top = targetRect.top;
            ddZone.style.left = targetRect.left;
            ddZone.style.width = targetRect.right - targetRect.left;
            ddZone.style.height = targetRect.bottom - targetRect.top;


            if (dragData.target.el.id.startsWith(CELLS_SELECTOR)/*nodeIsFirstCellParent(dragData.target.el)*/ && allAvailableCells.length > 1) {
                ddZone.style.background = TARGET_ZONE_GREEN;
                ddTargetUnderlay.style.background = UNDERLAY_GREEN;
                e.dataTransfer.dropEffect = "move";

            } else {
                ddZone.style.background = TARGET_ZONE_BLUE;
                ddTargetUnderlay.style.background = UNDERLAY_BLUE;
                e.dataTransfer.dropEffect = "copy";
            }
        }
        return false;
    }

    function nodeIsFirstCellParent(node) {
        const firstChild = node.firstChild;
        return firstChild && firstChild.id && firstChild.id.startsWith(CELLS_SELECTOR);
    }

    let lastDragData;

    function ddTargetOnDragEnter(e) {
    }

    function ddTargetOnDragLeave(e) {
        ddTargetUnderlay.style.top = 0; ddTargetUnderlay.style.left = 0; ddTargetUnderlay.style.width = 0; ddTargetUnderlay.style.height = 0;
        ddZone.style.top = 0; ddZone.style.left = 0; ddZone.style.width = 0; ddZone.style.height = 0;
    }

    function ddTargetOnDrop(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        // drag source is over drag target
        if (e.target.classList.contains("dd-target")) {
            processValidDrop(e);
        }
        if (e.target.classList.contains("start-dd-target") || e.target.parentNode.classList.contains("start-dd-target")) {
            processFirstDrop(e);
        }
        ddZone.style.top = 0; ddZone.style.left = 0; ddZone.style.width = 0; ddZone.style.height = 0;
        ddTargetUnderlay.style.top = 0; ddTargetUnderlay.style.left = 0; ddTargetUnderlay.style.width = 0; ddTargetUnderlay.style.height = 0;
        dragDataList = []
    }

    let prohibitedTargets = [];

    /**
     * Prohibited targets are all selected cells and their parents if
     * every child of that parent is also selected and prohibited
     */
    const addProhibitedTargets = function() {

        let selectedCells = document.querySelectorAll('.cell-selected');

        for (let i = 0; i < selectedCells.length; i++) {
                prohibitedTargets.push(selectedCells[i]);
        }

        for (let i = 0; i < prohibitedTargets.length; i++) {

            if (!prohibitedTargets[i] || prohibitedTargets[i].id === CANVAS_ROOT_ID) {
                break;
            }

            let nextParent = prohibitedTargets[i].parentNode;
            let prohibitedChildrenCount = 0;

            for (let j = 0; j < nextParent.children.length; j++) {
                if (prohibitedTargets.includes(nextParent.children[j])) {
                    ++prohibitedChildrenCount;
                }
            }

            if (prohibitedChildrenCount === nextParent.children.length && !prohibitedTargets.includes(nextParent)) {
                prohibitedTargets.push(nextParent);
            }
        }
    };

    const resetProhibitedTargets = function() {
        prohibitedTargets = [];
    };


    let allAvailableCells = [];

    function cellOnDragStart(e) {
        e.dataTransfer.effectAllowed = "all";


        allAvailableCells = canvasParent.querySelectorAll('div[id^='.concat(CELLS_SELECTOR).concat(']'));
        addToCellSelection(this);


        const selectedCells = canvasParent.querySelectorAll('.cell-selected');

        for (let i = 0; i < selectedCells.length; i++) {
            selectedCells[i].style.opacity = '0.4';
        }

        addProhibitedTargets();

        dragSource = {
            type: 'Cell',
            selectionSize: selectedCells.length
        }


    }

    function cellOnDragEnd(e) {

        for (let i = 0; i < dragTargets.length; i++) {
            dragTargets[i].style.top = 0; dragTargets[i].style.left = 0; dragTargets[i].style.width = 0; dragTargets[i].style.height = 0;
        }

        let newDraggableCells = document.querySelectorAll('div[id^='.concat(CELLS_SELECTOR).concat(']'));

        for (let i = 0; i < newDraggableCells.length; i++) {
            newDraggableCells[i].style.opacity = '1';
        }

        resetProhibitedTargets();

    }

    let cellSelection = [];

    const addToCellSelection = function(cellNode) {
        cellNode.classList.add('cell-selected');
        if (!cellSelection.includes(cellNode)) {
            cellSelection.push(cellNode);
        }
    };

    const removeFromCellSelection = function(cellNode) {
        cellNode.classList.remove('cell-selected');
        for (let i = cellSelection.length; i >= 0; i--) {
            if (cellSelection[i] === cellNode) {
                cellSelection.splice(i, 1);
            }
        }
    };


    function traverseAndExtractCellIds(confPart, ids) {
        if (confPart !== null && typeof confPart === "object" ) {

            if (confPart.type === 'cell') {
                ids.push('#'.concat(CANVAS_ROOT_ID).concat('-').concat(confPart.id));
            } else if (confPart.cells) {
                for (let i = 0; i < confPart.cells.length; i++) {
                    traverseAndExtractCellIds(confPart.cells[i], ids);
                }
            }
        }
        else {
            // confPart is a number or string => do nothing
        }
    }

    function getAllAvailableCells() {

        const ids = [];
        traverseAndExtractCellIds(conf, ids);

        if (ids.length === 0) {
            return [];
        } else {
            return document.querySelectorAll(ids.join(','));
        }
    }


    function cellOnClick(e) {

        if (!e.ctrlKey && !e.metaKey) {
            let newDraggableCells = getAllAvailableCells();
            for (let i = 0; i < newDraggableCells.length; i++) {
                removeFromCellSelection(newDraggableCells[i]);
            }
        }

        if (this.classList.contains('cell-selected') && (e.ctrlKey || e.metaKey)) {
            removeFromCellSelection(this);
        } else {
            addToCellSelection(this);
        }
        e.stopPropagation();
    }


    let ddZone = document.querySelector('.dd-target-zone');


    // TRACKING MECHANISM

    const getMinDstAndDirection = function(rect, e, insideFrame) {

        let dstToTop = Math.abs(e.clientY - rect.top);
        let dstToBottom = Math.abs(e.clientY - rect.bottom);
        let dstToLeft = Math.abs(e.clientX - rect.left);
        let dstToRight = Math.abs(e.clientX - rect.right);

        let min = dstToTop;
        let overDirection = 'top';

        if (dstToBottom < min) {
            min = dstToBottom;
            overDirection = 'bottom';
        }

        if (dstToLeft < min) {
            min = dstToLeft;
            overDirection = 'left';
        }

        if (dstToRight < min) {
            min = dstToRight;
            overDirection = 'right';
        }
        return {min, overDirection};
    };

    const minDistanceToCell = function(frRect, e) {

        let dstToTopLeft = sqrt(sqr(Math.abs(e.clientX - frRect.left))+sqr(Math.abs(e.clientY - frRect.top)));
        let dstToBottomLeft = sqrt(sqr(Math.abs(e.clientX - frRect.left))+sqr(Math.abs(e.clientY - frRect.bottom)));
        let dstToTopRight = sqrt(sqr(Math.abs(e.clientX - frRect.right))+sqr(Math.abs(e.clientY - frRect.top)));
        let dstToBottomRight = sqrt(sqr(Math.abs(e.clientX - frRect.right))+sqr(Math.abs(e.clientY - frRect.bottom)));

        let min = dstToTopLeft;

        if (dstToBottomLeft < min) { min = dstToBottomLeft; }
        if (dstToTopRight < min) { min = dstToTopRight; }
        if (dstToBottomRight < min) { min = dstToBottomRight; }

        return min;

    };

    const traverseAndFindClosestCell = function(target, e) {
        let minDst = Number.MAX_SAFE_INTEGER, cell = allAvailableCells[0];

        for (let i = 0; i < allAvailableCells.length; i++) {

            let currentMin = minDistanceToCell(allAvailableCells[i].getBoundingClientRect(), e);
            if (currentMin < minDst) {
                minDst = currentMin;
                cell = allAvailableCells[i];
            }
        }

        let minDstAndDirection = getMinDstAndDirection(cell.getBoundingClientRect(), e, false);
        return {cell, overDirection: minDstAndDirection.overDirection};
    };

    const getFrameParentNode = function (node) {
        if (node.classList.contains('canvas')) {
            return null;
        }
        if (node.classList.contains('frame')) {
            return node;
        } else {
            return getFrameParentNode(node.parentNode);
        }
    };

    /**
     * Will return first valid target
     * @param node
     */
    const getValidTargetNode = function(node) {
        if (!node) {
            return null;
        }

        const confId = domIdToConfId(node.id);

        if (getConfigSlice(conf, confId)) { // Valid target, no need for further lookup
            return node;
        } else if (node.firstElementChild && node.firstElementChild.id.startsWith(CELLS_SELECTOR)) { // First cell parent, return cell as valid target
            return node.firstElementChild;
        } else { // Cell child, move up until first valid target is found
            return getValidTargetNode(node.parentNode);
        }
    };


    let lastClientX, lastClientY;


    const canvasOnDragOver = function(e) {

        // Valid targets are cells and any parent excluding first one
        const target = getValidTargetNode(e.target);


        if (e.clientX === lastClientX && e.clientY === lastClientY) {
            // No changes since last drag over call
            return;
        }
        lastClientX = e.clientX;
        lastClientY = e.clientY;


        if (!target) {
            for (let i = 0; i < dragTargets.length; i++) {
                dragTargets[i].style.top = 0; dragTargets[i].style.left = 0; dragTargets[i].style.width = 0; dragTargets[i].style.height = 0;
            }
            return;
        }

        let overDirection = 'top'; // can be either 'top', 'bottom', 'left' or 'right'
        let closestCell;

        // Find nearest track point inside a cell
        if (target.id.startsWith(CELLS_SELECTOR)) {
            closestCell = target;
            overDirection = getMinDstAndDirection(closestCell.getBoundingClientRect(), e, true).overDirection;
        }
        // Traverse col and row groups in search for closest frame
        else {
            let closestFrameAndDirection = traverseAndFindClosestCell(target, e);
            closestCell = closestFrameAndDirection.cell;
            overDirection = closestFrameAndDirection.overDirection;
        }

        if (!closestCell) {
            for (let i = 0; i < dragTargets.length; i++) {
                dragTargets[i].style.top = 0; dragTargets[i].style.left = 0; dragTargets[i].style.width = 0; dragTargets[i].style.height = 0;
            }
            return;
        }

        if (!e.altKey && prohibitedTargets.includes(closestCell)) {
            for (let i = 0; i < dragTargets.length; i++) {
                dragTargets[i].style.top = 0; dragTargets[i].style.left = 0; dragTargets[i].style.width = 0; dragTargets[i].style.height = 0;
            }
            return;
        }
        setTargetPositions(closestCell, overDirection, e);
    };

    /**
     * Tell how many drag targets should be rendered for provided cell and direction
     * @param node - cell or row/col-group
     * @param direction - 'top', 'bottom', 'right' or 'left'
     * @param currentCount
     * @returns object {firstZoneType: string either 'edge' or 'gap', count: number >= 0}|{gapRect: {top: number, left: number, width: number, height: number}, firstZoneType: 'gap', count: number >= 0}
     */
    const countCellDDZonesForDirection = function(node, direction, currentCount) {

        if (node.id === CANVAS_ROOT_ID) {
            ++currentCount;
            dragDataList.push({target: {el: node, direction: direction}});
            return {count: currentCount, firstZoneType: 'edge'}
        }

        let isDirectedInsideGap = false;
        let gapRect;


        const confSlice = getConfigSlice(conf, domIdToConfId(node.id));
        //if (!confSlice) { // Current iteration is on first cell parent (skip to one parent above)
        //    return countCellDDZonesForDirection(node.parentNode, direction, currentCount);
        //}
        const parentConfSlice = getParentConfigSlice(conf, domIdToConfId(node.id));

        let currentNodeIsCell = false;

        if (confSlice.type === 'cell') { // use first parent for all relevant gap calculations
            node = node.parentNode;
            currentNodeIsCell = true;
        }


        if (direction === 'top' && parentConfSlice.type === 'column') {
            isDirectedInsideGap = !!node.previousElementSibling;

            if (isDirectedInsideGap) {
                let rect = node.getBoundingClientRect();
                let siblingRect = node.previousElementSibling.getBoundingClientRect();
                let parentRect = node.parentNode.getBoundingClientRect();
                let siblingBottom = siblingRect.bottom;

                let height = rect.top - siblingBottom;
                let top = siblingBottom;

                if (height < DD_HEIGHT) {
                    top = top - ((DD_HEIGHT - height) / 2);
                    height = DD_HEIGHT;
                }

                if (height > DD_HEIGHT) {
                    top = rect.top - DD_HEIGHT;
                    height = DD_HEIGHT;
                }

                gapRect = {
                    top: top,
                    left: parentRect.left,
                    width: parentRect.right - parentRect.left,
                    height: height
                }
            }
        }
        else if (direction === 'bottom' && parentConfSlice.type === 'column') {
            isDirectedInsideGap = !!node.nextElementSibling;

            if (isDirectedInsideGap) {

                let rect = node.getBoundingClientRect();
                let siblingRect = node.nextElementSibling.getBoundingClientRect();
                let parentRect = node.parentNode.getBoundingClientRect();
                let siblingTop = siblingRect.top;

                let height = siblingTop - rect.bottom;
                let top = rect.bottom;

                if (height < DD_HEIGHT) {
                    top = top - ((DD_HEIGHT - height) / 2);
                    height = DD_HEIGHT;
                }

                if (height > DD_HEIGHT) {
                    top = rect.bottom;
                    height = DD_HEIGHT;
                }

                gapRect = {
                    top: top,
                    left: parentRect.left,
                    width: parentRect.right - parentRect.left,
                    height: height
                }

            }
        }
        else if (direction === 'left' && parentConfSlice.type === 'row') {
            isDirectedInsideGap = !!node.previousElementSibling;

            if (isDirectedInsideGap) {

                let rect = node.getBoundingClientRect();
                let siblingRect = node.previousElementSibling.getBoundingClientRect();
                let parentRect = node.parentNode.getBoundingClientRect();
                let siblingRight = siblingRect.right;

                let width = rect.left - siblingRight;
                let left = siblingRight;

                if (width < DD_WIDTH) {
                    left = left - ((DD_WIDTH - width) / 2);
                    width = DD_WIDTH;
                }

                if (width > DD_WIDTH) {
                    left = rect.left - DD_WIDTH;
                    width = DD_WIDTH;
                }

                gapRect = {
                    top: parentRect.top,
                    left: left,
                    width: width,
                    height: parentRect.bottom - parentRect.top
                }

            }
        }
        else if (direction === 'right' && parentConfSlice.type === 'row') {
            isDirectedInsideGap = !!node.nextElementSibling;

            if (isDirectedInsideGap) {

                let rect = node.getBoundingClientRect();
                let siblingRect = node.nextElementSibling.getBoundingClientRect();
                let parentRect = node.parentNode.getBoundingClientRect();
                let siblingLeft = siblingRect.left;

                let width = siblingLeft - rect.right;
                let left = rect.right;

                if (width < DD_WIDTH) {
                    left = left - ((DD_WIDTH - width) / 2);
                    width = DD_WIDTH;
                }

                if (width > DD_WIDTH) {
                    left = rect.right;
                    width = DD_WIDTH;
                }

                gapRect = {
                    top: parentRect.top,
                    left: left,
                    width: width,
                    height: parentRect.bottom - parentRect.top
                }

            }
        } else {
            isDirectedInsideGap = false;
        }

        ++currentCount;
        if (currentNodeIsCell) { // Push cell
            dragDataList.push({target: {el: node.firstElementChild, direction: direction}});
        } else {
            dragDataList.push({target: {el: node, direction: direction}});
        }


        if (isDirectedInsideGap) {
            let beforeChild = node.nextElementSibling;

            if (direction === 'top' || direction === 'left') {
                beforeChild = node;
            }

            ++currentCount;
            dragDataList.push({target: {el: node.parentNode, direction: direction, before: beforeChild}});
            return {count: currentCount, firstZoneType: 'gap', gapRect: gapRect }
        } else {
            return countCellDDZonesForDirection(node.parentNode, direction, currentCount);
        }


    };

    const getDragDataOnReversedIndex = function(index) {
        return dragDataList[dragDataList.length - index - 1];
    };

    const getDragDataOnNormalIndex = function(index) {
        return dragDataList[index];

    };

    let currentDragTargetData = {targets: [], closestXorYs: [], directions: [], stepSize: DD_WIDTH};

    const setTargetPositions = function(closestCell, direction, e) {

        dragDataList = [];
        currentDragTargetData = {targets: [], closestXorYs: [], directions: [], stepSize: DD_WIDTH};

        let zoneData = countCellDDZonesForDirection(closestCell, direction, 0);
        let frRect = closestCell.getBoundingClientRect();

        let centerX = (frRect.right + frRect.left) / 2;
        let centerY = (frRect.top + frRect.bottom) / 2;

        let onlyOneTargetPresent = zoneData.count === 1;
        let target = dragTargets[0];
        let top, left, width, height;

        switch(direction) {
            case 'top':
                if (zoneData.firstZoneType === 'gap') {

                    top = zoneData.gapRect.top;
                    left = frRect.left;
                    width = frRect.right - frRect.left;
                    height = Math.abs(zoneData.gapRect.top - frRect.top) + DD_HEIGHT;

                    if (top + height <= centerY) {
                        target.style.top = top; target.style.left = left; target.style.width = width; target.style.height = height; target.style.background = 'transparent';

                        currentDragTargetData.targets.push(target);
                        currentDragTargetData.closestXorYs.push(1);
                        currentDragTargetData.directions.push('top');
                        currentDragTargetData.stepSize =  height / zoneData.count;

                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }


                } else if (onlyOneTargetPresent) {

                    top = frRect.top - DD_HEIGHT;
                    left = frRect.left;
                    width = frRect.right - frRect.left;
                    height = DD_HEIGHT;

                    if (top + height <= centerY) {
                        target.style.top = top; target.style.left = left; target.style.width = width; target.style.height = height; target.style.background = 'transparent';

                        currentDragTargetData.targets.push(target);
                        currentDragTargetData.closestXorYs.push(1);
                        currentDragTargetData.directions.push('top');
                        currentDragTargetData.stepSize =  height / zoneData.count;

                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }

                } else { // Default

                    top = frRect.top - DD_HEIGHT;
                    left = frRect.left;
                    width = frRect.right - frRect.left;
                    height = DD_HEIGHT * 2;

                    if (top + height <= centerY) {
                        target.style.top = top; target.style.left = left; target.style.width = width; target.style.height = height; target.style.background = 'transparent';

                        currentDragTargetData.targets.push(target);
                        currentDragTargetData.closestXorYs.push(1);
                        currentDragTargetData.directions.push('top');
                        currentDragTargetData.stepSize =  height / zoneData.count;

                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }

                }
                break;

            case 'bottom':
                if (zoneData.firstZoneType === 'gap') {

                    height = Math.abs(zoneData.gapRect.top + zoneData.gapRect.height - frRect.bottom) + DD_HEIGHT;
                    top = zoneData.gapRect.top + zoneData.gapRect.height - height;
                    left = frRect.left;
                    width = frRect.right - frRect.left;

                    if (top >= centerY) {
                        target.style.top = top; target.style.left = left; target.style.width = width; target.style.height = height; target.style.background = 'transparent';

                        currentDragTargetData.targets.push(target);
                        currentDragTargetData.closestXorYs.push(1);
                        currentDragTargetData.directions.push('bottom');
                        currentDragTargetData.stepSize =  height / zoneData.count;

                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }


                } else if (onlyOneTargetPresent) {
                    top = frRect.bottom;
                    left = frRect.left;
                    width = frRect.right - frRect.left;
                    height = DD_HEIGHT;

                    if (top >= centerY) {
                        target.style.top = top; target.style.left = left; target.style.width = width; target.style.height = height; target.style.background = 'transparent';

                        currentDragTargetData.targets.push(target);
                        currentDragTargetData.closestXorYs.push(1);
                        currentDragTargetData.directions.push('bottom');
                        currentDragTargetData.stepSize =  height / zoneData.count;

                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }

                } else { // Default
                    top = frRect.bottom - DD_HEIGHT;
                    left = frRect.left;
                    width = frRect.right - frRect.left;
                    height = DD_HEIGHT * 2;

                    if (top >= centerY) {
                        target.style.top = top; target.style.left = left; target.style.width = width; target.style.height = height; target.style.background = 'transparent';

                        currentDragTargetData.targets.push(target);
                        currentDragTargetData.closestXorYs.push(1);
                        currentDragTargetData.directions.push('bottom');
                        currentDragTargetData.stepSize =  height / zoneData.count;

                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }
                }
                break;

            case 'left':
                if (zoneData.firstZoneType === 'gap') {

                    top = frRect.top;
                    width = Math.abs(zoneData.gapRect.left - frRect.left) + DD_WIDTH;
                    left = zoneData.gapRect.left;
                    height = frRect.bottom - frRect.top;

                    if (left + width <= centerX) {
                        target.style.top = top; target.style.left = left; target.style.width = width; target.style.height = height; target.style.background = 'transparent';

                        currentDragTargetData.targets.push(target);
                        currentDragTargetData.closestXorYs.push(1);
                        currentDragTargetData.directions.push('left');
                        currentDragTargetData.stepSize =  width / zoneData.count;

                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }

                } else if (onlyOneTargetPresent) {

                    top = frRect.top;
                    left = frRect.left - DD_WIDTH;
                    width = DD_WIDTH;
                    height = frRect.bottom - frRect.top;

                    if (left + width <= centerX) {
                        target.style.top = top; target.style.left = left; target.style.width = width; target.style.height = height; target.style.background = 'transparent';

                        currentDragTargetData.targets.push(target);
                        currentDragTargetData.closestXorYs.push(1);
                        currentDragTargetData.directions.push('left');
                        currentDragTargetData.stepSize =  width / zoneData.count;

                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }

                } else { // Default

                    top = frRect.top;
                    width = 2 * DD_WIDTH;
                    left = frRect.left - DD_WIDTH;
                    height = frRect.bottom - frRect.top;

                    if (left + width <= centerX) {
                        target.style.top = top; target.style.left = left; target.style.width = width; target.style.height = height; target.style.background = 'transparent';

                        currentDragTargetData.targets.push(target);
                        currentDragTargetData.closestXorYs.push(1);
                        currentDragTargetData.directions.push('left');
                        currentDragTargetData.stepSize =  width / zoneData.count;

                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }
                }
                break;

            case 'right':
                if (zoneData.firstZoneType === 'gap') {

                    top = frRect.top;
                    width = Math.abs(zoneData.gapRect.left + zoneData.gapRect.width - frRect.right) + DD_WIDTH;
                    left = zoneData.gapRect.left + zoneData.gapRect.width - width;
                    height = frRect.bottom - frRect.top;

                    if (left >= centerX) {
                        target.style.top = top; target.style.left = left; target.style.width = width; target.style.height = height; target.style.background = 'transparent';

                        currentDragTargetData.targets.push(target);
                        currentDragTargetData.closestXorYs.push(1);
                        currentDragTargetData.directions.push('right');
                        currentDragTargetData.stepSize =  width / zoneData.count;

                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }

                } else if (onlyOneTargetPresent) {

                    top = frRect.top;
                    left = frRect.right;
                    width = DD_WIDTH;
                    height = frRect.bottom - frRect.top;

                    if (left >= centerX) {
                        target.style.top = top; target.style.left = left; target.style.width = width; target.style.height = height; target.style.background = 'transparent';

                        currentDragTargetData.targets.push(target);
                        currentDragTargetData.closestXorYs.push(1);
                        currentDragTargetData.directions.push('right');
                        currentDragTargetData.stepSize =  width / zoneData.count;

                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }

                } else { // Default

                    top = frRect.top;
                    width = 2 * DD_WIDTH;
                    left = frRect.right - DD_WIDTH;
                    height = frRect.bottom - frRect.top;

                    if (left >= centerX) {
                        target.style.top = top; target.style.left = left; target.style.width = width; target.style.height = height; target.style.background = 'transparent';

                        currentDragTargetData.targets.push(target);
                        currentDragTargetData.closestXorYs.push(1);
                        currentDragTargetData.directions.push('right');
                        currentDragTargetData.stepSize =  width / zoneData.count;

                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }
                }
                break;

            default:
                for (let i = 0; i < dragTargets.length; i++) {
                    dragTargets[i].style.top = 0; dragTargets[i].style.left = 0; dragTargets[i].style.width = 0; dragTargets[i].style.height = 0;
                }
                break;
        }
    };


    btnContainer.dom.addEventListener('dragstart', function(e){
        allAvailableCells = getAllAvailableCells();
        this.style.opacity = '0.4';
        dragSource = {
            type: 'Button',
            selectionSize: 1
        };
        e.dataTransfer.effectAllowed = "all";

    });
    btnContainer.dom.addEventListener('drag', function(e){

    });
    btnContainer.dom.addEventListener('dragend', function(e){
        this.style.opacity = '1';
        for (let i = 0; i < dragTargets.length; i++) {
            dragTargets[i].style.top = 0; dragTargets[i].style.left = 0; dragTargets[i].style.width = 0; dragTargets[i].style.height = 0;
        }
    });


    let canvasParent = document.getElementById(CANVAS_ROOT_ID);
    canvasParent.addEventListener('dragover', canvasOnDragOver);



    document.querySelector('body').addEventListener('click', function() {
        let newDraggableCells = getAllAvailableCells();
        for (let i = 0; i < newDraggableCells.length; i++) {
            removeFromCellSelection(newDraggableCells[i]);
        }
    });

    document.addEventListener('keydown', function(event) {
        const key = event.key;
        if (key === "Delete") {

            let selectedCells = canvasParent.querySelectorAll('.cell-selected');
            for (let i = 0; i < selectedCells.length; i++) {
                const confId = domIdToConfId(selectedCells[i].id);
                removeConfSliceFromParent(conf, confId);
                configUpdated();
            }


            cellSelection = [];

            if (countAllCells() < 1) {
                startDDTarget.style.display = 'block';
            }
        }
    });



    // Return drag target
    const ddTargetParent = document.querySelector('.dd-target-parent');
    let dragTargets = ddTargetParent.querySelectorAll('.dd-target');

    for (let i = 0; i < dragTargets.length; i++) {
        dragTargets[i].addEventListener('dragover', ddTargetOnDragOver);
        dragTargets[i].addEventListener('dragenter', ddTargetOnDragEnter);
        dragTargets[i].addEventListener('dragleave', ddTargetOnDragLeave);
        dragTargets[i].addEventListener('drop', ddTargetOnDrop);
    }


    const sqrt = function(a) {
        return  Math.sqrt(a);
    };

    const sqr = function(a) {
        return Math.pow(a, 2);
    };


    // Start DD target setup
    let startDDTarget = document.querySelector('.start-dd-target');

    //startDDTarget.addEventListener('dragover', ddTargetOnDragOver);
    startDDTarget.addEventListener('dragenter', function(e) {
        this.style.background = UNDERLAY_BLUE;
    });
    startDDTarget.addEventListener('dragleave', function(e) {
        this.style.background = '#ffffffff';
    });
    startDDTarget.addEventListener('drop', ddTargetOnDrop);
    startDDTarget.addEventListener('dragover', ddTargetOnDragOver);


    let draggableCells = getAllAvailableCells();

    if (draggableCells.length > 0) {
        startDDTarget.style.display = 'none';
        startDDTarget.style.background = '#ffffffff';
    }

    const processFirstDrop = function(e) {

        const newCell = { type: 'cell', id: getNewCellId(), source: dragSource.source, height: 120, border: '1px solid' };
        conf.cells = [newCell];
        processNewConfig(CANVAS_ROOT_ID, conf, onCreateCellCb);

        let selectedCells = document.querySelectorAll('.cell-selected');
        for (let i = 0; i < selectedCells.length; i++) {
            selectedCells[i].classList.remove('cell-selected');
        }

        startDDTarget.style.display = 'none';
        startDDTarget.style.background = '#ffffffff';

    };

    const configsHistory = [];
    const MAX_NUMBER_OF_ITEMS_IN_HISTORY = 20;

    function addToConfigHistory(config) {
        configsHistory.push(Ext.clone(config));
        if (configsHistory.length > MAX_NUMBER_OF_ITEMS_IN_HISTORY) {
            configsHistory.splice(0, MAX_NUMBER_OF_ITEMS_IN_HISTORY - configsHistory.length);
        }
    }



});