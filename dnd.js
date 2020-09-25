Ext.onReady(function () {

    let tPanel = Ext.create('Ext.tab.Panel', {
        //height: 100,
        renderTo: 'ribbonSimple',
        items: [
            {
                xtype: 'panel',
                title: 'Canvas',
                tbar: Ext.create('Ext.toolbar.Toolbar', {
                    defaults: {
                        focusCls: '',
                        headerPosition: 'bottom'
                    },
                    items: [
                        {
                            xtype: 'buttongroup',
                            columns: 3,
                            height: 48,
                            defaults: {
                                focusCls: '',
                                xtype: 'button'
                            },
                            items: [
                                {
                                    text: 'Save as',
                                    height: 32,
                                    handler: function () {
                                    }
                                },
                                {
                                    text: 'Close',
                                    height: 32,
                                    handler: function () {
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'buttongroup',
                            columns: 3,
                            height: 48,
                            defaults: {
                                focusCls: '',
                                xtype: 'button'
                            },
                            items: [
                                {
                                    text: 'Report',
                                    cls: 'reportBtn',
                                    focusCls: '',
                                    height: 32,
                                    handler: function () {
                                    }
                                },

                            ]
                        },'->',
                        {
                            xtype: 'button',
                            text: 'Ctrl + click => Multiselekcija, Delete => Brisanje, Drag => Premjestanje, Alt + Drag => Kopiranje'
                        }

                        ]
                })
            }, {
                title: 'Second Tab',
                disabled: true
            }

        ]

    });

    let btnContainer = tPanel.down('[text=Report]').container;
    btnContainer.set({ draggable: 'true' });


    let ddTarget = document.querySelectorAll('.dd-target')[0];


    // Drag and drop data
    let dragData = {};

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
        node.addEventListener('dragend', frameOnDragEnd);
        node.addEventListener('click', frameOnClick);
    };


    const calcFrameName = function(selectionIndex, isCopyAction) {
        let frameName = newFrameName();

        if (dragData.source.type !== 'Button') {
            const frameInnerText = selectedFrames[selectionIndex].children[0].innerText;
            frameName = isCopyAction ? frameInnerText.concat(' - Copy') : frameInnerText;
        }
        return frameName;
    };


    const injectSelection = function(isCopyAction) {


        //if (dragData.source.type === 'Button' || dragData.source.selectionSize === 1) {
        let el = dragData.target.el;
        let referencedChildIndex = dragData.target.between[0];
        let referencedChildNode = el.children[referencedChildIndex];

        if (dragData.target.type === 'InBetween') {

            for (let i = 0; i < dragData.source.selectionSize; i++) {
                // Add node at the end
                if (referencedChildIndex >= el.children.length) {
                    el.appendChild(getNewFrameNode(calcFrameName(i, isCopyAction)));
                }
                // Insert before referenced child node
                else {
                    el.insertBefore(getNewFrameNode(calcFrameName(i, isCopyAction)), referencedChildNode);
                }
            }
        } else if (dragData.target.type === 'NewDirection') {

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

                for (let i = 0; i < dragData.source.selectionSize; i++) {
                    if (dragData.target.direction === 'top' || dragData.target.direction === 'left') {
                        el.insertBefore(getNewFrameNode(calcFrameName(i, isCopyAction)), innerGroup);
                    } else {
                        el.appendChild(getNewFrameNode(calcFrameName(i, isCopyAction)));
                    }
                }
            } else {
                for (let i = 0; i < dragData.source.selectionSize; i++) {
                    el.appendChild(getNewFrameNode(calcFrameName(i, isCopyAction)));
                }
            }
        } else if (dragData.target.type === 'SplitFrame') {

            if (dragData.target.direction === 'left' || dragData.target.direction === 'right') {
                let newGroup = document.createElement('div');
                newGroup.className = 'row-group';

                el.parentNode.insertBefore(newGroup, el);
                newGroup.appendChild(el);

                for (let i = 0; i < dragData.source.selectionSize; i++) {
                    if (dragData.target.direction === 'left') {
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

                for (let i = 0; i < dragData.source.selectionSize; i++) {
                    if (dragData.target.direction === 'left') {
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
            if (dragData.source.type !== 'Button') {
                deleteSelection();
            }

        }


        selectedFrames = [];

        let newDraggableCells = document.querySelectorAll('.frame');

        for (let i = 0; i < newDraggableCells.length; i++) {
            if (newDraggableCells[i].classList.contains('frame-selected')) {
                newDraggableCells[i].classList.remove('frame-selected');
                //addToFrameSelection(newDraggableCells[i]);
            }
        }



    };


    function handleDragOver(e) {
        if(e.preventDefault) {
            e.preventDefault();
        }
        return false;
    }

    function handleDragEnter(e) {
    }
    function handleDragLeave(e) {
    }

    function handleDrop(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        // drag source is over drag target
        if (e.target.classList.contains("dd-target")) {
            processValidDrop(e);
            //alert('successfull drop to '+ e.target.className);
        }
        ddTarget.style.top = 0;
        ddTarget.style.left = 0;
        ddTarget.style.width = 0;
        ddTarget.style.height = 0;
        delete dragData.target;
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


    function frameOnDragStart(e) {
        addToFrameSelection(this);

        let newDraggableCells = document.querySelectorAll('.frame');

        for (let i = 0; i < newDraggableCells.length; i++) {
            if (newDraggableCells[i].classList.contains('frame-selected')) {
                newDraggableCells[i].style.opacity = '0.4';
            }
        }

        addProhibitedTargets();

        dragData.source = {
            type: 'Frame',
            selectionSize: selectedFrames.length
        };


    }

    function frameOnDragEnd(e) {
        ddTarget.style.top = 0;
        ddTarget.style.left = 0;
        ddTarget.style.width = 0;
        ddTarget.style.height = 0;

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


        console.log(e);

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


    btnContainer.dom.addEventListener('dragstart', function(e){
        this.style.opacity = '0.4';
        dragData.source = {
            type: 'Button',
            selectionSize: 1
        };
    });
    btnContainer.dom.addEventListener('drag', function(e){});
    btnContainer.dom.addEventListener('dragend', function(e){
        this.style.opacity = '1';
        ddTarget.style.top = 0;
        ddTarget.style.left = 0;
        ddTarget.style.width = 0;
        ddTarget.style.height = 0;
    });

    ddTarget.addEventListener('dragover', handleDragOver);
    ddTarget.addEventListener('dragenter', handleDragEnter);
    ddTarget.addEventListener('dragleave', handleDragLeave);
    ddTarget.addEventListener('drop', handleDrop);

    let draggableCells = document.querySelectorAll('.frame');

    draggableCells.forEach(function (item) {
        item.addEventListener('dragstart', frameOnDragStart);
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
        if (nextParent.children.length === 1 && nextParent.children[0].classList.contains('frame')) {
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
            if (newDraggableCells.length <= 1) {
                let newRoot = document.createElement('div');
                newRoot.className = 'col-group';

                if (newDraggableCells.length === 1) {
                    newRoot.appendChild(newDraggableCells[0]);
                }

                while (canvasParent.childNodes.length) {
                    canvasParent.removeChild(canvasParent.firstChild);
                }
                canvasParent.appendChild(newRoot);
            }
        }
    });




    const DD_TARGET_WIDTH = 16, DD_TARGET_HEIGHT = 16;

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

    let canvasParentOnDragOver = function(e) {

        const target = e.target;
        let gapDDRectangle;

        if (!nodeContainsValidGroupCls(target) ||
            (!e.altKey && prohibitedTargets.includes(e.target))
        ) {
            ddTarget.style.top = 0;
            ddTarget.style.left = 0;
            ddTarget.style.width = 0;
            ddTarget.style.height = 0;
            delete dragData.target;
            return;
        }

        const rect = target.getBoundingClientRect();
        const childGapXs = [], childGapYs = [];

        let isRowGroupWithFrameSiblings = false, isColGroupWithFrameSiblings = false;

        const isRowGroup = target.classList.contains("row-group");
        const isColGroup = target.classList.contains("col-group");

        for (let i = 0; i < target.children.length; i++) {
            let child = target.children[i];
            let nextSibling = target.children[i+1];

            if (!nextSibling) { break; }

            if (!child.classList || !nextSibling.classList) { continue; }

            if (nodeContainsValidGroupCls(child) && nodeContainsValidGroupCls(nextSibling)) {
                isRowGroupWithFrameSiblings = isRowGroup;
                isColGroupWithFrameSiblings = isColGroup;

                if (isRowGroupWithFrameSiblings) {
                    childGapXs.push(child.getBoundingClientRect().right, nextSibling.getBoundingClientRect().left);
                } else if (isColGroupWithFrameSiblings) {
                    childGapYs.push(child.getBoundingClientRect().bottom, nextSibling.getBoundingClientRect().top);
                }
            }
        }

        // Mouse over left inner zone
        if (e.clientX <= rect.left + DD_TARGET_WIDTH) {
            ddTarget.style.top = rect.top + e.view.scrollY;
            ddTarget.style.left = rect.left;
            ddTarget.style.width = DD_TARGET_WIDTH;
            ddTarget.style.height = rect.bottom - rect.top;

            let type = 'SplitFrame';

            if (target.classList.contains('row-group')) {
                type = 'InBetween';
            } else if (target.classList.contains('col-group')) {
                type = 'NewDirection';
            }

            dragData.target = {
                type: type,
                el: target,
                between: [0, 1],
                direction: 'left'
            };
        }
        // Mouse over right inner zone
        else if (e.clientX >= rect.right - DD_TARGET_WIDTH) {
            ddTarget.style.top = rect.top + e.view.scrollY;
            ddTarget.style.left = rect.right - DD_TARGET_WIDTH;
            ddTarget.style.width = DD_TARGET_WIDTH;
            ddTarget.style.height = rect.bottom - rect.top;

            let type = 'SplitFrame', between = [0, 1];

            if (target.classList.contains('row-group')) {
                type = 'InBetween';
                between = [target.children.length, target.children.length + 1];
            } else if (target.classList.contains('col-group')) {
                type = 'NewDirection';
            }

            dragData.target = {
                type: type,
                el: target,
                between: between,
                direction: 'right'
            };

        }
        // Mouse over top inner zone
        else if (e.clientY <= rect.top + DD_TARGET_HEIGHT ) {
            ddTarget.style.top = rect.top + e.view.scrollY;
            ddTarget.style.left = rect.left;
            ddTarget.style.width = rect.right - rect.left;
            ddTarget.style.height = DD_TARGET_HEIGHT;

            let type = 'SplitFrame';

            if (target.classList.contains('row-group')) {
                type = 'NewDirection';
            } else if (target.classList.contains('col-group')) {
                type = 'InBetween';
            }

            dragData.target = {
                type: type,
                el: target,
                between: [0, 1],
                direction: 'top'
            };
        }
        // Mouse over bottom inner zone
        else if (e.clientY >= rect.bottom - DD_TARGET_HEIGHT) {
            ddTarget.style.top = rect.bottom - DD_TARGET_HEIGHT + e.view.scrollY;
            ddTarget.style.left = rect.left;
            ddTarget.style.width = rect.right - rect.left;
            ddTarget.style.height = DD_TARGET_HEIGHT;

            let type = 'SplitFrame', between = [0, 1];

            if (target.classList.contains('row-group')) {
                type = 'NewDirection';
            } else if (target.classList.contains('col-group')) {
                type = 'InBetween';
                between = [target.children.length, target.children.length + 1];
            }

            dragData.target = {
                type: type,
                el: target,
                between: between,
                direction: 'bottom'
            };
        }
        // Mouse between two row-group childs
        else if(isRowGroupWithFrameSiblings) {
            gapDDRectangle = mouseIsBetweenGroupChildren(target, childGapXs, e.clientX);
            if (gapDDRectangle) {
                ddTarget.style.top = gapDDRectangle.top + e.view.scrollY;
                ddTarget.style.left = gapDDRectangle.left;
                ddTarget.style.width = DD_TARGET_WIDTH;
                ddTarget.style.height = rect.bottom - rect.top;

                dragData.target = {
                    type: 'InBetween',
                    el: target,
                    between: getInBetweenIndexes(e.clientX, childGapXs, [target.children.length, target.children.length + 1]),
                    direction: 'right'
                };
            }
        }
        // Mouse between two col-group childs
        else if(isColGroupWithFrameSiblings) {
            gapDDRectangle = mouseIsBetweenGroupChildren(target, childGapYs, e.clientY);
            if (gapDDRectangle) {
                ddTarget.style.top = gapDDRectangle.top + e.view.scrollY;
                ddTarget.style.left = gapDDRectangle.left;
                ddTarget.style.width = rect.right - rect.left;
                ddTarget.style.height = DD_TARGET_HEIGHT;

                dragData.target = {
                    type: 'InBetween',
                    el: target,
                    between: getInBetweenIndexes(e.clientY, childGapYs, [target.children.length, target.children.length + 1]),
                    direction: 'bottom'
                };
            }
        }
        // Mouse over free zone (no dd targets located here)
        else {
            ddTarget.style.top = 0;
            ddTarget.style.left = 0;
            ddTarget.style.width = 0;
            ddTarget.style.height = 0;
            delete dragData.target;
        }


    };

    canvasParent.addEventListener('dragover', canvasParentOnDragOver);



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


});