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
                        text: 'Show flex wireframe',
                        enableToggle: true,
                        listeners: {
                            toggle: function(thisCmp, state) {

                                let groups = document.querySelectorAll('.row-group, .col-group');

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
                                        groups[i].style.background = lightColor;
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
                        value: 6,
                        listeners: {
                            change: function(cmp, newValue) {
                                console.log('change occured',cmp,newValue);
                                let groups = document.querySelectorAll('.row-group, .col-group');

                                for (let i = 0; i < groups.length; i++) {
                                    groups[i].style.gap = newValue+'px';
                                }
                            }
                        }
                    },]
            })
        }, {title: 'Second Tab', disabled: true}]
    });

    let btnContainer = tPanel.down('[text=Report]').container;
    btnContainer.set({ draggable: 'true' });

    // Drag and drop data
    let dragDataList = [];
    let dragSource = {};

    const getNewFrameNode = function(n) {
        const frameChild = document.createElement('div');
        frameChild.className = 'frame';
        frameChild.draggable = true;
        frameChild.innerHTML = '<div class="frame-content">' + n + '</div></div>';
        frameChild.classList.add('frame-selected');

        appendListenersToFrameNode(frameChild);
        return frameChild;
    };

    const appendListenersToFrameNode = function(node) {
        node.addEventListener('dragstart', frameOnDragStart);
        node.addEventListener('dragenter', frameOnDragEnter);
        node.addEventListener('dragleave', frameOnDragLeave);
        node.addEventListener('dragend', frameOnDragEnd);
        node.addEventListener('click', frameOnClick);
    };


    const calcFrameName = function(selectionIndex, isCopyAction) {
        let frameName = newFrameName();

        //return frameName;

        if (dragSource.type !== 'Button') {
            const frameInnerText = selectedFrames[selectionIndex].children[0].innerText;
            frameName = isCopyAction ? frameInnerText.concat(' - Copy') : frameInnerText;
        }
        return frameName;
    };


    const injectSelection = function(isCopyAction) {

        let el = lastDragData.target.el;
        let direction = lastDragData.target.direction;
        let referencedChildNode = lastDragData.target.before;

        console.log('direction and target');
        console.log(el);
        console.log(direction);

        let dragType = 'InBetween';

        if (el.classList.contains('frame')) {
            dragType = 'SplitFrame';
        }
        else if (
            (el.classList.contains('col-group') && (direction === 'left' || direction === 'right')) ||
            (el.classList.contains('row-group') && (direction === 'top' || direction === 'bottom')))
        {
            dragType = 'NewDirection';
        }
        else if (!referencedChildNode &&
            (
                (el.classList.contains('col-group') && direction === 'top') ||
                (el.classList.contains('row-group') && direction === 'left')
            )
        ) {
            dragType = 'AtGroupStart';
        }
        else if (!referencedChildNode &&
            (
                (el.classList.contains('col-group') && direction === 'bottom') ||
                (el.classList.contains('row-group') && direction === 'right')
            )
        ) {
            dragType = 'AtGroupEnd'
        }

        if (dragType === 'AtGroupStart') {
            for (let i = 0; i < dragSource.selectionSize; i++) {
                let firstChild = el.children[0];
                el.insertBefore(getNewFrameNode(calcFrameName(i, isCopyAction)), firstChild);
            }
        }
        else if (dragType === 'AtGroupEnd') {
            for (let i = 0; i < dragSource.selectionSize; i++) {
                el.appendChild(getNewFrameNode(calcFrameName(i, isCopyAction)));
            }
        }
        else if (dragType === 'InBetween') {

            for (let i = 0; i < dragSource.selectionSize; i++) {
                // Add node at the end
                if (!referencedChildNode) {
                    el.appendChild(getNewFrameNode(calcFrameName(i, isCopyAction)));
                }
                // Insert before referenced child node
                else {
                    el.insertBefore(getNewFrameNode(calcFrameName(i, isCopyAction)), referencedChildNode);
                }
            }
        } else if (dragType === 'NewDirection') {

            let innerGroup;

            if (el.classList.contains('row-group')) {
                el.classList.remove('row-group');
                el.classList.add('col-group');

                if(el.children.length > 0) {
                    innerGroup = document.createElement('div');
                    innerGroup.className = 'row-group';
                }
            } else if (el.classList.contains('col-group')){
                el.classList.remove('col-group');
                el.classList.add('row-group');

                if(el.children.length > 0) {
                    innerGroup = document.createElement('div');
                    innerGroup.className = 'col-group';
                }
            }

            if (innerGroup) {
                while (el.childNodes.length) {
                    innerGroup.appendChild(el.firstChild);
                }
                el.appendChild(innerGroup);

                for (let i = 0; i < dragSource.selectionSize; i++) {
                    if (direction === 'top' || direction === 'left') {
                        el.insertBefore(getNewFrameNode(calcFrameName(i, isCopyAction)), innerGroup);
                    } else {
                        el.appendChild(getNewFrameNode(calcFrameName(i, isCopyAction)));
                    }
                }
            } else {
                for (let i = 0; i < dragSource.selectionSize; i++) {
                    el.appendChild(getNewFrameNode(calcFrameName(i, isCopyAction)));
                }
            }
        } else if (dragType === 'SplitFrame') {

            if (direction === 'left' || direction === 'right') {
                let newGroup = document.createElement('div');
                newGroup.className = 'row-group';

                el.parentNode.insertBefore(newGroup, el);
                newGroup.appendChild(el);

                for (let i = 0; i < dragSource.selectionSize; i++) {
                    if (direction === 'left') {
                        newGroup.insertBefore(getNewFrameNode(calcFrameName(i, isCopyAction)), el);
                    } else {
                        newGroup.appendChild(getNewFrameNode(calcFrameName(i, isCopyAction)));
                    }
                }
            } else {

                let newGroup = document.createElement('div');
                newGroup.className = 'col-group';

                el.parentNode.insertBefore(newGroup, el);
                newGroup.appendChild(el);

                for (let i = 0; i < dragSource.selectionSize; i++) {
                    if (direction === 'left') {
                        newGroup.insertBefore(getNewFrameNode(calcFrameName(i, isCopyAction)), el);
                    } else {
                        newGroup.appendChild(getNewFrameNode(calcFrameName(i, isCopyAction)));
                    }
                }
            }
        }

    };

    const deleteSelection = function() {

        for (let i = 0; i < selectedFrames.length; i++) {
            let nextParent = selectedFrames[i].parentNode;
            nextParent.removeChild(selectedFrames[i]);

            if(nextParent.children.length === 1 && nextParent.children[0].classList.contains('frame')) {
                let groupParent = nextParent.parentNode;
                groupParent.insertBefore(nextParent.children[0], nextParent);
                groupParent.removeChild(nextParent);
                deleteEmptyParent(groupParent);
            } else {
                deleteEmptyParent(nextParent);
            }
        }

    };

    const processValidDrop = function(e) {

        let isCopyAction = e.altKey;

        if (isCopyAction) {
            injectSelection(isCopyAction);
        }
        else {
            injectSelection(isCopyAction);
            if (dragSource.type !== 'Button') {
                deleteSelection();
            }

        }


        selectedFrames = [];

        let newDraggableCells = document.querySelectorAll('.frame');

        for (let i = 0; i < newDraggableCells.length; i++) {
            if (newDraggableCells[i].classList.contains('frame-selected')) {
                newDraggableCells[i].classList.remove('frame-selected');
            }
        }



    };


    function ddTargetOnDragOver(e) {
       if(e.preventDefault) {
            e.preventDefault();
        }
        return false;
    }

    let enteredZones = 0;

    let lastDragData;

    function ddTargetOnDragEnter(e) {
        ++enteredZones;
        let targetIndex = -1;
        for (let i = 0; i < dragTargets.length; i++) {
            if (dragTargets[i] === this) {
                targetIndex = i;
                break;
            }
        }

        let targets = document.querySelectorAll('.dd-target');
        for (let i = 0; i < targets.length; i++) {
            targets[i].style.background = 'transparent';
        }

        this.style.background = ddColors[0];



        //this.style.display = 'block';


        let dragData = getDragDataOnNormalIndex(targetIndex);
        if (dragDataList[0].target.direction === 'top' || dragDataList[0].target.direction === 'left') {
            dragData = getDragDataOnReversedIndex(targetIndex);
        }
        lastDragData = dragData;

        if (dragData && dragData.target) {
            let targetRect = dragData.target.el.getBoundingClientRect();


            switch (dragDataList[0].target.direction) {
                case 'top':
                case 'bottom':
                    this._oldleft = this.style.left;
                    this._oldwidth = this.style.width;
                    this.style.left = targetRect.left;
                    this.style.width = targetRect.right - targetRect.left;

                    break;
                case 'right':
                case 'left':
                    this._oldtop = this.style.top;
                    this._oldheight = this.style.height;
                    this.style.top = targetRect.top;
                    this.style.height = targetRect.bottom - targetRect.top;
                    break;
                default:
                    break;
            }


            let ddTargetRect = this.getBoundingClientRect();

            ddZone.style.top = targetRect.top;
            ddZone.style.left = targetRect.left;
            ddZone.style.width = targetRect.right - targetRect.left;
            ddZone.style.height = targetRect.bottom - targetRect.top;
            //ddZone.style.outline = '2px solid ' + this.style.background;


            /*
            switch (dragDataList[0].target.direction) {
                case 'top':
                    ddZoneDirection.style.top = targetRect.top;
                    ddZoneDirection.style.left = targetRect.left;
                    ddZoneDirection.style.width = targetRect.right - targetRect.left;
                    ddZoneDirection.style.height = ddTargetRect.bottom - targetRect.top;
                    break;
                case 'bottom':
                    ddZoneDirection.style.top = ddTargetRect.top;
                    ddZoneDirection.style.left = targetRect.left;
                    ddZoneDirection.style.width = targetRect.right - targetRect.left;
                    ddZoneDirection.style.height = targetRect.bottom - ddTargetRect.top;
                    break;
                case 'right':
                    ddZoneDirection.style.top = targetRect.top;
                    ddZoneDirection.style.left = ddTargetRect.left;
                    ddZoneDirection.style.width = targetRect.right - ddTargetRect.left;
                    ddZoneDirection.style.height = targetRect.bottom - targetRect.top;
                    break;
                case 'left':
                    ddZoneDirection.style.top = targetRect.top;
                    ddZoneDirection.style.left = ddTargetRect.right;
                    ddZoneDirection.style.width = ddTargetRect.right - targetRect.left;
                    ddZoneDirection.style.height = targetRect.bottom - targetRect.top;

                    break;
                default:
                    break;
            }
            ddZoneDirection.style.background = this.style.background;*/



        }
    }
    function ddTargetOnDragLeave(e) {
        --enteredZones;

        this.style.background = 'transparent';

        switch (dragDataList[0].target.direction) {
            case 'top':
            case 'bottom':
                if (this._oldleft) {this.style.left = this._oldleft;}
                if (this._oldwidth) {this.style.width = this._oldwidth;}
                break;
            case 'right':
            case 'left':
                if (this._oldtop) {this.style.top = this._oldtop;}
                if (this._oldheight) {this.style.height = this._oldheight;}
                break;
            default:
                break;
        }



        if (enteredZones < 1) {
            ddZone.style.top = 0; ddZone.style.left = 0; ddZone.style.width = 0; ddZone.style.height = 0;
            ddZoneDirection.style.top = 0; ddZoneDirection.style.left = 0; ddZoneDirection.style.width = 0; ddZoneDirection.style.height = 0;
        }
    }

    function ddTargetOnDrop(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        // drag source is over drag target
        if (e.target.classList.contains("dd-target")) {
            processValidDrop(e);
            //alert('successfull drop to '+ e.target.className);
        }
        if (e.target.classList.contains("start-dd-target") || e.target.parentNode.classList.contains("start-dd-target")) {
            processFirstDrop(e);

        }
        ddZone.style.top = 0; ddZone.style.left = 0; ddZone.style.width = 0; ddZone.style.height = 0;
        ddZoneDirection.style.top = 0; ddZoneDirection.style.left = 0; ddZoneDirection.style.width = 0; ddZoneDirection.style.height = 0;
        dragDataList = [];
        enteredZones = 0;
    }

    /**
     * Logic that populated list of prohibited targets (needed for move frame(s) action)
     * as frame(s) cannot be moved within itself and self parents
     *
     */

    let prohibitedTargets = [];

    const addProhibitedTargets = function() {

        let newDraggableCells = document.querySelectorAll('.frame');

        for (let i = 0; i < newDraggableCells.length; i++) {
            if(newDraggableCells[i].classList.contains('frame-selected')) {
                prohibitedTargets.push(newDraggableCells[i]);
            }
        }

        for (let i = 0; i < prohibitedTargets.length; i++) {

            if (!prohibitedTargets[i] || prohibitedTargets[i].classList.contains('canvas-parent')) {
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


    let allAvailableFrames = [];

    function frameOnDragStart(e) {


        allAvailableFrames = canvasParent.querySelectorAll('.frame');
        addToFrameSelection(this);

        for (let i = 0; i < allAvailableFrames.length; i++) {
            if (allAvailableFrames[i].classList.contains('frame-selected')) {
                allAvailableFrames[i].style.opacity = '0.4';
            }
        }

        addProhibitedTargets();

        dragSource = {
            type: 'Frame',
            selectionSize: selectedFrames.length
        }


    }

    function frameOnDragEnd(e) {

        for (let i = 0; i < dragTargets.length; i++) {
            dragTargets[i].style.top = 0; dragTargets[i].style.left = 0; dragTargets[i].style.width = 0; dragTargets[i].style.height = 0;
        }

        let newDraggableCells = document.querySelectorAll('.frame');

        for (let i = 0; i < newDraggableCells.length; i++) {
            newDraggableCells[i].style.opacity = '1';
        }

        resetProhibitedTargets();

    }

    let selectedFrames = [];

    const addToFrameSelection = function(frameNode) {
        frameNode.classList.add('frame-selected');
        if (!selectedFrames.includes(frameNode)) {
            selectedFrames.push(frameNode);
        }
    };

    const removeFromFrameSelection = function(frameNode) {
        frameNode.classList.remove('frame-selected');
        for (let i = selectedFrames.length; i >= 0; i--) {
            if (selectedFrames[i] === frameNode) {
                selectedFrames.splice(i, 1);
            }
        }


    };

    function frameOnClick(e) {

        if (!e.ctrlKey && !e.metaKey) {
            let newDraggableCells = document.querySelectorAll('.frame');
            for (let i = 0; i < newDraggableCells.length; i++) {
                removeFromFrameSelection(newDraggableCells[i]);
            }
        }

        if (this.classList.contains('frame-selected') && (e.ctrlKey || e.metaKey)) {
            removeFromFrameSelection(this);
        } else {
            addToFrameSelection(this);
        }
        e.stopPropagation();
    }


    // On drag over behaviour
    const canvasParentOnDragEnter = function(e) {
        //trackingPoints = [];
        //populateTrackingPoints(canvasParent);




    };


    let ddZone = document.querySelector('.dd-target-zone');
    let ddZoneDirection = document.querySelector('.dd-target-zone-direction-overlay');


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


/*
        let centerX = (rect.left + rect.right) / 2;
        let centerY = (rect.top + rect.bottom) / 2;

        let dstToTopBorder = sqrt(sqr(Math.abs(e.clientX - centerX)) + sqr(Math.abs(e.clientY - rect.top)));
        let dstToBottomBorder = sqrt(sqr(Math.abs(e.clientX - centerX)) + sqr(Math.abs(e.clientY - rect.bottom)));
        let dstToLeftBorder = sqrt(sqr(Math.abs(e.clientX - rect.left)) + sqr(Math.abs(e.clientY - centerY)));
        let dstToRightBorder = sqrt(sqr(Math.abs(e.clientX - rect.right)) + sqr(Math.abs(e.clientY - centerY)));


        let min = dstToTopBorder;
        let overDirection = 'top';

        if (dstToBottomBorder < min) {min = dstToBottomBorder; overDirection = 'bottom';}
        if (dstToLeftBorder < min) {min = dstToLeftBorder; overDirection = 'left';}
        if (dstToRightBorder < min) {min = dstToRightBorder; overDirection = 'right';}*/

        return {min, overDirection};
    };

    const traverseAndFindClosestFrame = function(target, e) {
        let minDst = 10000, frame = null, overDirection = null;

        for (let i = 0; i < allAvailableFrames.length; i++) {
            let minDstAndDirection = getMinDstAndDirection(allAvailableFrames[i].getBoundingClientRect(), e, false);

            let currentMin = minDstAndDirection.min;

            if (currentMin < minDst) {
                minDst = currentMin;
                overDirection = minDstAndDirection.overDirection;
                frame = allAvailableFrames[i];
            }
        }
        return {frame, overDirection};
    };

    const DD_WIDTH = 12, DD_HEIGHT = 12;

    const frameOnDragEnter = function(e) {};
    const frameOnDragLeave = function(e) {};

    const getFrameParentNode = function (node) {
        if (node.classList.contains('canvas-parent')) {
            return null;
        }
        if (node.classList.contains('frame')) {
            return node;
        } else {
            return getFrameParentNode(node.parentNode);
        }
    };

    let lastClosestFrame, lastDirection, lastClientX, lastClientY;


    const canvasParentOnDragOver = function(e) {

        let target = e.target;
        let gapDDRectangle;


        if (e.clientX === lastClientX && e.clientY === lastClientY) {
            // No changes since last drag over call
            return;
        }
        lastClientX = e.clientX;
        lastClientY = e.clientY;



        if (!nodeContainsValidGroupCls(target)) {
            target = getFrameParentNode(target);
        }

        if (!target) {
            target = canvasParent.children[0];
        }

        if (!target) {
            for (let i = 0; i < dragTargets.length; i++) {
                dragTargets[i].style.top = 0; dragTargets[i].style.left = 0; dragTargets[i].style.width = 0; dragTargets[i].style.height = 0;
            }
            return;
        }

        /* TODO figure out this part
        if (!e.altKey && prohibitedTargets.includes(e.target)
        ) {
            ddTarget.style.top = 0; ddTarget.style.left = 0; ddTarget.style.width = 0; ddTarget.style.height = 0;
            delete dragDataList.target;
            return;
        }*/

        const rect = target.getBoundingClientRect();
        const childGapXs = [], childGapYs = [];

        // TODO do not search for nearest points if user is dragging over one of legit dd targets

        let overDirection = 'top';// can be either 'top', 'bottom', 'left' or 'right'
        let closestFrame;

        // Find nearest track point inside a frame
        if (target.classList.contains('frame')) {

            closestFrame = getFrameParentNode(target);
            overDirection = getMinDstAndDirection(closestFrame.getBoundingClientRect(), e, true).overDirection;

        }
        // Traverse col or row groups in search for closest frame
        else {

            for (let i = 0; i < dragTargets.length; i++) {
                dragTargets[i].style.top = 0; dragTargets[i].style.left = 0; dragTargets[i].style.width = 0; dragTargets[i].style.height = 0;
            }
            return;
            /* TODO playing around */

            let closestFrameAndDirection = traverseAndFindClosestFrame(target, e);

            closestFrame = closestFrameAndDirection.frame;
            overDirection = closestFrameAndDirection.overDirection;

        }

        if (!closestFrame) {
            for (let i = 0; i < dragTargets.length; i++) {
                dragTargets[i].style.top = 0; dragTargets[i].style.left = 0; dragTargets[i].style.width = 0; dragTargets[i].style.height = 0;
            }
            return;
        }



       // if (lastClosestFrame === closestFrame && lastDirection === overDirection) {
            // Do nothing => every drop target stays at exactly same place
       // } else {
       //     lastClosestFrame = closestFrame;
        //    lastDirection = overDirection;
            setTargetPositions(closestFrame, overDirection);
      //  }

    };


    /**
     * Tell how many drag targets should be rendered for provided frame and direction
     * @param node - frame or row/col-group
     * @param direction - 'top', 'bottom', 'right' or 'left'
     * @param currentCount
     * @returns object {firstZoneType: string either 'edge' or 'gap', count: number >= 0}|{gapRect: {top: number, left: number, width: number, height: number}, firstZoneType: 'gap', count: number >= 0}
     */
    const countFrameDDZonesForDirection = function(node, direction, currentCount) {

        if (node.classList.contains('canvas-parent')) {
            return {count: currentCount, firstZoneType: 'edge'}
        }

        let isDirectedInsideGap = false;
        let gapRect;

        if (direction === 'top' && node.parentNode.classList.contains('col-group')) {
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
        else if (direction === 'bottom' && node.parentNode.classList.contains('col-group')) {
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
        else if (direction === 'left' && node.parentNode.classList.contains('row-group')) {
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
        else if (direction === 'right' && node.parentNode.classList.contains('row-group')) {
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
        dragDataList.push({target: {el: node, direction: direction}});

        if (isDirectedInsideGap) {
            let beforeChild = node.nextElementSibling;

            if (direction === 'top' || direction === 'left') {
                beforeChild = node;
            }

            ++currentCount;
            dragDataList.push({target: {el: node.parentNode, direction: direction, before: beforeChild}});
            return {count: currentCount, firstZoneType: 'gap', gapRect: gapRect }
        } else {
            return countFrameDDZonesForDirection(node.parentNode, direction, currentCount);
        }


    };

    const getDragDataOnReversedIndex = function(index) {
        return dragDataList[dragDataList.length - index - 1];
    };

    const getDragDataOnNormalIndex = function(index) {
        return dragDataList[index];

    };

    const setTargetPositions = function(closestFrame, direction) {

        dragDataList = [];
        let zoneData = countFrameDDZonesForDirection(closestFrame, direction, 0);

        let frRect = closestFrame.getBoundingClientRect();

        let centerX = (frRect.right + frRect.left) /2;
        let centerY = (frRect.top + frRect.bottom) /2;

        let onlyOneTargetPresent = zoneData.count === 1;

        switch(direction) {
            case 'top':
                let lastBottom = 0;
                for (let i = 0; i < zoneData.count; i++) {
                    let top, left, width, height;
                    if (i === 0 && zoneData.firstZoneType === 'gap') {
                        top = zoneData.gapRect.top;
                        left = frRect.left;
                        width = frRect.right - frRect.left;
                        height = zoneData.gapRect.height;
                        lastBottom = top + height;
                    } else if (i === 0 && zoneData.firstZoneType === 'edge') {
                        let dragData = getDragDataOnReversedIndex(i);
                        let targetRect = dragData.target.el.getBoundingClientRect();
                        top = onlyOneTargetPresent ? frRect.top : frRect.top - DD_HEIGHT;
                        left = frRect.left;
                        width = frRect.right - frRect.left;
                        height = DD_HEIGHT;
                        lastBottom = top + height;

                    } else {
                        let dragData = getDragDataOnReversedIndex(i);
                        let targetRect = dragData.target.el.getBoundingClientRect();
                        top = lastBottom;
                        left = frRect.left;
                        width = frRect.right - frRect.left;
                        height = DD_HEIGHT;
                        lastBottom = top + height;
                    }

                    let target = getDragTarget(i);
                    if (lastBottom <= centerY) {
                        target.style.top = top;
                        target.style.left = left;
                        target.style.width = width;
                        target.style.height = height;
                        //target.style.background = getDDTargetColor(zoneData.count - i - 1);

                        //if (i > 0) {
                            target.style.background = 'transparent';
                        //} else {
                        //    target.style.background = ddColors[0];
                        //}
                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }
                }
                for (let i = zoneData.count; i < dragTargets.length; i++) {
                    dragTargets[i].style.top = 0; dragTargets[i].style.left = 0; dragTargets[i].style.width = 0; dragTargets[i].style.height = 0;
                }
                break;
            case 'bottom':
                let lastTop = 0;
                for (let i = zoneData.count - 1; i >= 0 ; i--) {
                    let top, left, width, height;
                    if (i === zoneData.count - 1 && zoneData.firstZoneType === 'gap') {
                        top = zoneData.gapRect.top;
                        left = frRect.left;
                        width = frRect.right - frRect.left;
                        height = zoneData.gapRect.height;
                        lastTop = top;
                    } else if (i === zoneData.count - 1 && zoneData.firstZoneType === 'edge') {
                        let dragData = getDragDataOnNormalIndex(i);
                        let targetRect = dragData.target.el.getBoundingClientRect();
                        top = onlyOneTargetPresent ? frRect.bottom - DD_HEIGHT: frRect.bottom;
                        left = frRect.left;
                        width = frRect.right - frRect.left;
                        height = DD_HEIGHT;
                        lastTop = top;

                    } else {
                        let dragData = getDragDataOnNormalIndex(i);
                        let targetRect = dragData.target.el.getBoundingClientRect();
                        top = lastTop - DD_HEIGHT;
                        left = frRect.left;
                        width = frRect.right - frRect.left;
                        height = DD_HEIGHT;
                        lastTop = top;
                    }


                    let target = getDragTarget(i);
                    if (lastTop >= centerY) {
                        target.style.top = top;
                        target.style.left = left;
                        target.style.width = width;
                        target.style.height = height;
                        //target.style.background = getDDTargetColor(i);

                        //if (i < zoneData.count - 1) {
                            target.style.background = 'transparent';
                        //} else {
                        //    target.style.background = ddColors[0];
                        //}
                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }

                }

                for (let i = zoneData.count; i < dragTargets.length; i++) {
                    dragTargets[i].style.top = 0; dragTargets[i].style.left = 0; dragTargets[i].style.width = 0; dragTargets[i].style.height = 0;
                }
                break;
            case 'left':
                let lastRight = 0;
                for (let i = 0; i < zoneData.count; i++) {
                    let top, left, width, height;
                    if (i === 0 && zoneData.firstZoneType === 'gap') {
                        top = frRect.top;
                        left = zoneData.gapRect.left;
                        width = zoneData.gapRect.width;
                        height = frRect.bottom - frRect.top;
                        lastRight = left + width;
                    } else if (i === 0 && zoneData.firstZoneType === 'edge') {
                        let dragData = getDragDataOnReversedIndex(i);
                        let targetRect = dragData.target.el.getBoundingClientRect();
                        top = frRect.top;
                        left = onlyOneTargetPresent ? frRect.left: frRect.left - DD_WIDTH;
                        width = DD_WIDTH;
                        height = frRect.bottom - frRect.top;
                        lastRight = left + width;

                    } else {
                        let dragData = getDragDataOnReversedIndex(i);
                        let targetRect = dragData.target.el.getBoundingClientRect();
                        top = frRect.top;
                        left = lastRight;
                        width = DD_WIDTH;
                        height = frRect.bottom - frRect.top;
                        lastRight = left + width;
                    }

                    let target = getDragTarget(i);
                    if (lastRight <= centerX) {
                        target.style.top = top;
                        target.style.left = left;
                        target.style.width = width;
                        target.style.height = height;
                        //target.style.background = getDDTargetColor(zoneData.count - i - 1);
                        //if (i > 0) {
                            target.style.background = 'transparent';
                        //} else {
                        //    target.style.background = ddColors[0];
                        //}
                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }
                }
                for (let i = zoneData.count; i < dragTargets.length; i++) {
                    dragTargets[i].style.top = 0; dragTargets[i].style.left = 0; dragTargets[i].style.width = 0; dragTargets[i].style.height = 0;
                }

                break;
            case 'right':
                let lastLeft = 0;

                for (let i = zoneData.count - 1; i >= 0; i--) {
                    let top, left, width, height;
                    if (i === zoneData.count - 1 && zoneData.firstZoneType === 'gap') {
                        top = frRect.top;
                        left = zoneData.gapRect.left;
                        width = zoneData.gapRect.width;
                        height = frRect.bottom - frRect.top;
                        lastLeft = left;
                    } else if (i === zoneData.count - 1 && zoneData.firstZoneType === 'edge') {
                        let dragData = getDragDataOnNormalIndex(i);
                        let targetRect = dragData.target.el.getBoundingClientRect();
                        top = frRect.top;
                        left = onlyOneTargetPresent ? frRect.right - DD_WIDTH: frRect.right;
                        width = DD_WIDTH;
                        height = frRect.bottom - frRect.top;
                        lastLeft = left;

                    } else {
                        let dragData = getDragDataOnNormalIndex(i);
                        let targetRect = dragData.target.el.getBoundingClientRect();
                        top = frRect.top;
                        left = lastLeft - DD_WIDTH;
                        width = DD_WIDTH;
                        height = frRect.bottom - frRect.top;
                        lastLeft = left;
                    }

                    let target = getDragTarget(i);
                    if (lastLeft >= centerX) {
                        target.style.top = top;
                        target.style.left = left;
                        target.style.width = width;
                        target.style.height = height;
                        //target.style.background = getDDTargetColor(i);

                        //if (i < zoneData.count - 1) {
                            target.style.background = 'transparent';
                        //} else {
                        //    target.style.background = ddColors[0];
                        //}
                    } else {
                        // There is no space available for this drag target
                        target.style.top = 0; target.style.left = 0; target.style.width = 0; target.style.height = 0;
                    }
                }
                for (let i = zoneData.count; i < dragTargets.length; i++) {
                    dragTargets[i].style.top = 0; dragTargets[i].style.left = 0; dragTargets[i].style.width = 0; dragTargets[i].style.height = 0;
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
        allAvailableFrames = canvasParent.querySelectorAll('.frame');
        this.style.opacity = '0.4';
        dragSource = {
            type: 'Button',
            selectionSize: 1
        };

        /*if (allAvailableFrames.length === 0) {
            startDDTarget.style.background = ddColors[1];
        }*/

    });
    btnContainer.dom.addEventListener('drag', function(e){

    });
    btnContainer.dom.addEventListener('dragend', function(e){
        this.style.opacity = '1';
        for (let i = 0; i < dragTargets.length; i++) {
            dragTargets[i].style.top = 0; dragTargets[i].style.left = 0; dragTargets[i].style.width = 0; dragTargets[i].style.height = 0;
        }

        /*if (allAvailableFrames.length === 0) {
            startDDTarget.style.background = '#ffffffff';
        }*/

    });

    let draggableCells = document.querySelectorAll('.frame');

    draggableCells.forEach(function (item) {
        item.addEventListener('dragstart', frameOnDragStart);
        item.addEventListener('dragenter', frameOnDragEnter);
        item.addEventListener('dragleave', frameOnDragLeave);
        item.addEventListener('dragend', frameOnDragEnd);
        item.addEventListener('click', frameOnClick);
    });


    /**
     * Hover logic
     */
    let canvasParent = document.querySelectorAll('.canvas-parent')[0];


    // Playground

    let rowGroupChild = document.createElement('div');
    rowGroupChild.className = 'row-group';

    let frameChild = document.createElement('div');
    frameChild.className = 'frame';
    frameChild.innerHTML = `<div class="frame-content">Frame 10</div></div>`;
    rowGroupChild.appendChild(frameChild);

    canvasParent.appendChild(rowGroupChild);
    canvasParent.removeChild(rowGroupChild);



    document.querySelector('body').addEventListener('click', function() {
        let newDraggableCells = document.querySelectorAll('.frame');
        for (let i = 0; i < newDraggableCells.length; i++) {
            removeFromFrameSelection(newDraggableCells[i]);
        }
    });


    // HANDLE FRAME DELETION
    let deleteEmptyParent = function(nextParent) {

        if (!nextParent || nextParent.classList.contains('canvas-parent')) { return; }

        let parentNode = nextParent.parentNode;


        if (nextParent.children.length < 1) {
            parentNode.removeChild(nextParent);
        }
        if (nextParent.children.length === 1) {
            parentNode.insertBefore(nextParent.children[0], nextParent);
            parentNode.removeChild(nextParent);
        }

        deleteEmptyParent(parentNode);
    };

    document.addEventListener('keydown', function(event) {
        const key = event.key;
        if (key === "Delete") {
            let newDraggableCells = document.querySelectorAll('.frame');


            for (let i = 0; i < newDraggableCells.length; i++) {
                if (newDraggableCells[i].classList.contains('frame-selected')) {
                    let nextParent = newDraggableCells[i].parentNode;
                    nextParent.removeChild(newDraggableCells[i]);


                    if (nextParent.children.length === 1 && nextParent.children[0].classList.contains('frame')) {
                        let groupParent = nextParent.parentNode;
                        groupParent.insertBefore(nextParent.children[0], nextParent);
                        groupParent.removeChild(nextParent);
                        deleteEmptyParent(groupParent);
                    } else {
                        deleteEmptyParent(nextParent);
                    }
                }
            }

            selectedFrames = [];

            newDraggableCells = document.querySelectorAll('.frame');
            if (newDraggableCells.length < 1) {

                startDDTarget.style.display = 'block';
                /*let newRoot = document.createElement('div');
                newRoot.className = 'col-group';

                if (newDraggableCells.length === 1) {
                    newRoot.appendChild(newDraggableCells[0]);
                }

                while (canvasParent.childNodes.length) {
                    canvasParent.removeChild(canvasParent.firstChild);
                }
                canvasParent.appendChild(newRoot);*/
            }
        }
    });



    /**
     * Tells whether mouse pointer is between 2 X coordinates on row groups or 2 Y coordinates on col group
     * @param coord1 - x1 or y1
     * @param coord2 - x2 or y2
     * @param clientXorY - mouse x or y
     */
    let mouseIsBetweenXorY = function(coord1, coord2, clientXorY) {
        return clientXorY > coord1 && clientXorY < coord2;
    };

    /**
     * Returns object {top: ddTargetTop, left: ddTargetLeft} if mouse pointer is currently between two row or col group children of frame type,
     * false otherwise
     * @param group - parent row or col group (as Node element)
     * @param gapXOrYs - self explainable
     * @param clientXorY - self explainable
     */
    let mouseIsBetweenGroupChildren = function(group, gapXOrYs, clientXorY) {

        if (group.classList.contains('row-group')) {
            for (let i = 0; i < gapXOrYs.length; i+=2) {
                if (mouseIsBetweenXorY(gapXOrYs[i],gapXOrYs[i+1],clientXorY)) {
                    return {top: group.getBoundingClientRect().top, left: gapXOrYs[i]};
                }
            }
        } else if (group.classList.contains('col-group')) {
            for (let i = 0; i < gapXOrYs.length; i+=2) {
                if (mouseIsBetweenXorY(gapXOrYs[i],gapXOrYs[i+1],clientXorY)) {
                    return {top: gapXOrYs[i], left: group.getBoundingClientRect().left};
                }
            }
        }
        return false;
    };

    /**
     * Returns true if provided node contains valid row/col group or frame class, false otherwise
     * @param node
     */
    let nodeContainsValidGroupCls = function(node) {
        return node.classList.contains('frame') ||
            node.classList.contains('row-group') ||
            node.classList.contains('col-group');
    };


    let getInBetweenIndexes = function(mouseXOrY, gapXorYs, defaultValue) {

        for (let i = 0; i < gapXorYs.length; i+=2) {

            let first = gapXorYs[i];
            let second = gapXorYs[i+1];

            if (mouseXOrY >= first && mouseXOrY <= second) {
                let firstIndex = parseInt(i/2+1);
                return [firstIndex, firstIndex + 1];
            }
        }
        return defaultValue;
    };


    /*
    let trackingPoints = [];

    const populateTrackingPoints = function(parent) {

        for (let i = 0; i < parent.children.length; i++) {

            let childRect = parent.children[i].getBoundingClientRect();

            trackingPoints.push({
                centerX: (childRect.right + childRect.left) / 2,
                centerY: (childRect.top + childRect.bottom) / 2,
                node: parent.children[i]
            });
        }



    };*/



    canvasParent.addEventListener('dragover', canvasParentOnDragOver);
    canvasParent.addEventListener('dragenter', canvasParentOnDragEnter);



    /* Get next available frame name */

    const newFrameName = function() {

        const frames = document.querySelectorAll('.frame > div');

        const ids = [];

        for (let i = 0; i < frames.length; i++) {
            let n = frames[i].textContent.split(' ')[1];
            ids.push(parseInt(n));
        }
        const next = Math.max(...ids) + 1;

        if (next < 1) {
            return 'Frame 1';
        } else {
            return 'Frame ' + next;
        }
    };





    // Return drag target
    const ddTargetParent = document.querySelector('.dd-target-parent');
    let dragTargets = ddTargetParent.querySelectorAll('.dd-target');

    for (let i = 0; i < dragTargets.length; i++) {
        dragTargets[i].addEventListener('dragover', ddTargetOnDragOver);
        dragTargets[i].addEventListener('dragenter', ddTargetOnDragEnter);
        dragTargets[i].addEventListener('dragleave', ddTargetOnDragLeave);
        dragTargets[i].addEventListener('drop', ddTargetOnDrop);
    }




    const getDragTarget = function(index) {
        if (!dragTargets[index]) {

            let newTarget = document.createElement('div');
            newTarget.className = 'dd-target';
            newTarget.addEventListener('dragover', ddTargetOnDragOver);
            newTarget.addEventListener('dragenter', ddTargetOnDragEnter);
            newTarget.addEventListener('dragleave', ddTargetOnDragLeave);
            newTarget.addEventListener('drop', ddTargetOnDrop);

            ddTargetParent.appendChild(newTarget);

            dragTargets = ddTargetParent.querySelectorAll('.dd-target');
        }
        return dragTargets[index];
    };

    const ddColors = ['#00b4d8','#00b4d8','#00b4d8','#00b4d8','#00b4d8', '#00b4d8']/*['#48cae4','#00b4d8','#0096c7','#0077b6','#0096c7', '#00b4d8']*/;

    const getDDTargetColor = function(index) {

        let colorIndex = index % 6;

        return ddColors[colorIndex];


        let lastIndex = 3;
        let remainderWithThree = index % 3;

        if (remainderWithThree === 0) {
            if (index % 2 === 0) { // even number, return first color
                return ddColors[0];
            } else { // odd number, return last color
                return ddColors[lastIndex];
            }
        } else {
            let nearestNDividiableWithThree = index - remainderWithThree;
            if (nearestNDividiableWithThree % 2 === 0) { // direction is ascending
                return ddColors[remainderWithThree];
            } else { // direction is descending
                return [lastIndex - remainderWithThree];
            }
        }
    };

    // Memo functions (sqrt and sqr)

    let sqrtMemo = {}, sqrMemo = {};

    const sqrt = function(a) {
        return  Math.sqrt(a);
        if (sqrtMemo[a] === undefined) {
            sqrtMemo[a] = Math.sqrt(a);
        }
        return sqrtMemo[a];
    };

    const sqr = function(a) {
        return Math.pow(a, 2);
        if(sqrMemo[a] === undefined) {
            sqrMemo[a] = Math.pow(a, 2);
        }
        return sqrMemo[a];
    };


    window.memoObjs = {sqrtMemo, sqrMemo};


    let targetZoneColor = '#6ED3FF';


    // Start dd target setup

    let startDDTarget = document.querySelector('.start-dd-target');

    //startDDTarget.addEventListener('dragover', ddTargetOnDragOver);
    startDDTarget.addEventListener('dragenter', function(e) {
        this.style.background = ddColors[0];
        this.style.innerHTML = '';
    });
    startDDTarget.addEventListener('dragleave', function(e) {
        this.style.background = '#ffffffff';
    });
    startDDTarget.addEventListener('drop', ddTargetOnDrop);
    startDDTarget.addEventListener('dragover', ddTargetOnDragOver);

    if (draggableCells.length > 0) {
        startDDTarget.style.display = 'none';
        startDDTarget.style.background = '#ffffffff';
    }

    const processFirstDrop = function(e) {

        canvasParent.appendChild(getNewFrameNode(calcFrameName(0, false)));

        let newDraggableCells = document.querySelectorAll('.frame');

        for (let i = 0; i < newDraggableCells.length; i++) {
            if (newDraggableCells[i].classList.contains('frame-selected')) {
                newDraggableCells[i].classList.remove('frame-selected');
            }
        }

        startDDTarget.style.display = 'none';
        startDDTarget.style.background = '#ffffffff';

    };

});