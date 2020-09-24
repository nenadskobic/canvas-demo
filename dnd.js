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
                                    height: 32,
                                    handler: function () {
                                    }
                                }

                            ]
                        }]
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

        console.log(e.target.classList);
        // move dragged elem to the selected drop target
        if (e.target.classList.contains("dd-target")) {
            alert('successfull drop to '+ e.target.className);
        }
        ddTarget.style.top = 0;
        ddTarget.style.left = 0;
        ddTarget.style.width = 0;
        ddTarget.style.height = 0;
        delete dragData.target;
        console.log('handle drop');
    }

    /**
     * Logic that populated list of prohibited targets (needed for move frame(s) action)
     * as frame(s) cannot be moved within itself and self parents
     *
     */

    let prohibitedTargets = [];

    const addProhibitedTargets = function() {

        for (let i = 0; i < draggableCells.length; i++) {
            if(draggableCells[i].classList.contains('frame-selected')) {
                prohibitedTargets.push(draggableCells[i]);
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

        for (let i = 0; i < draggableCells.length; i++) {
            if(draggableCells[i].classList.contains('frame-selected')) {
                draggableCells[i].style.opacity = '0.4';
            }
        }

        addProhibitedTargets();
        console.log('prohibitedTargets');
        console.log(prohibitedTargets);

    }

    function frameOnDragEnd(e) {
        ddTarget.style.top = 0;
        ddTarget.style.left = 0;
        ddTarget.style.width = 0;
        ddTarget.style.height = 0;

        for (let i = 0; i < draggableCells.length; i++) {
            if(draggableCells[i].classList.contains('frame-selected')) {
                draggableCells[i].style.opacity = '1';
                removeFromFrameSelection(draggableCells[i]);
            }
        }

        resetProhibitedTargets();
        console.log('dragend, prohibitedTargets: ');
        console.log(prohibitedTargets);

    }

    const frameSelection = [];

    const addToFrameSelection = function(frameNode) {
        frameNode.classList.add('frame-selected');
        frameSelection.push(frameNode);
    };

    const removeFromFrameSelection = function(frameNode) {
        frameNode.classList.remove('frame-selected');
        for (let i = frameSelection.length; i >= 0; i--) {
            if (frameSelection[i] === frameNode) {
                frameSelection.splice(i, 1);
            }
        }


    };

    function frameOnClick(e) {

        console.log('frameOnClick: ',e, this);
        console.log(e.target);

        if (!e.shiftKey) {
            for (let i = 0; i < draggableCells.length; i++) {
                removeFromFrameSelection(draggableCells[i]);
            }
        }

        if (this.classList.contains('frame-selected') && e.shiftKey) {
            removeFromFrameSelection(this);
        } else {
            addToFrameSelection(this);
        }
        e.stopPropagation();
    }


    btnContainer.dom.addEventListener('dragstart', function(e){
        this.style.opacity = '0.4';
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

    // TODO insert/remove elements playground


    console.log('canvasParent', canvasParent);

    let rowGroupChild = document.createElement('div');
    rowGroupChild.className = 'row-group';

    let frameChild = document.createElement('div');
    frameChild.className = 'frame';
    frameChild.innerHTML = `<div class="frame-content">Frame 10</div></div>`;
    rowGroupChild.appendChild(frameChild);

    canvasParent.appendChild(rowGroupChild);
    canvasParent.removeChild(rowGroupChild);



    document.querySelector('body').addEventListener('click', function() {
        for (let i = 0; i < draggableCells.length; i++) {
            removeFromFrameSelection(draggableCells[i]);
        }
    });


    // HANDLE FRAME DELETION
    let deleteEmptyParent = function(nextParent) {
        if (!nextParent || nextParent.classList.contains('canvas-parent')) { return; }

        let parentNode = nextParent.parentNode;

        if (nextParent.children.length < 1) {
            parentNode.removeChild(nextParent);
        }

        deleteEmptyParent(parentNode);
    };

    document.addEventListener('keydown', function(event) {
        const key = event.key;
        if (key === "Delete") {
            for (let i = 0; i < draggableCells.length; i++) {
                if (draggableCells[i].classList.contains('frame-selected')) {
                    let nextParent = draggableCells[i].parentNode;
                    nextParent.removeChild(draggableCells[i]);
                    deleteEmptyParent(nextParent);
                }
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
    let mouseIsBetweenFrameChilds = function(group, gapXOrYs, clientXorY) {

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
        }
        // Mouse over right inner zone
        else if (e.clientX >= rect.right - DD_TARGET_WIDTH) {
            ddTarget.style.top = rect.top + e.view.scrollY;
            ddTarget.style.left = rect.right - DD_TARGET_WIDTH;
            ddTarget.style.width = DD_TARGET_WIDTH;
            ddTarget.style.height = rect.bottom - rect.top;
        }
        // Mouse over top inner zone
        else if (e.clientY <= rect.top + DD_TARGET_HEIGHT ) {
            ddTarget.style.top = rect.top + e.view.scrollY;
            ddTarget.style.left = rect.left;
            ddTarget.style.width = rect.right - rect.left;
            ddTarget.style.height = DD_TARGET_HEIGHT;
        }
        // Mouse over bottom inner zone
        else if (e.clientY >= rect.bottom - DD_TARGET_HEIGHT) {
            ddTarget.style.top = rect.bottom - DD_TARGET_HEIGHT + e.view.scrollY;
            ddTarget.style.left = rect.left;
            ddTarget.style.width = rect.right - rect.left;
            ddTarget.style.height = DD_TARGET_HEIGHT;
        }
        // Mouse between two row-group childs
        else if(isRowGroupWithFrameSiblings) {
            gapDDRectangle = mouseIsBetweenFrameChilds(target,childGapXs, e.clientX);
            if (gapDDRectangle) {
                ddTarget.style.top = gapDDRectangle.top + e.view.scrollY;
                ddTarget.style.left = gapDDRectangle.left;
                ddTarget.style.width = DD_TARGET_WIDTH;
                ddTarget.style.height = rect.bottom - rect.top;
            }
        }
        // Mouse between two col-group childs
        else if(isColGroupWithFrameSiblings) {
            gapDDRectangle = mouseIsBetweenFrameChilds(target,childGapYs, e.clientY);
            if (gapDDRectangle) {
                ddTarget.style.top = gapDDRectangle.top + e.view.scrollY;
                ddTarget.style.left = gapDDRectangle.left;
                ddTarget.style.width = rect.right - rect.left;
                ddTarget.style.height = DD_TARGET_HEIGHT;
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


});