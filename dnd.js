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

    console.log(tPanel.down('[text=Report]').container);

    console.log(document.querySelectorAll('td')[0]);


    let ddTarget = document.querySelectorAll('.dd-target')[0];



    function handleDragOver(e) {
        if(e.preventDefault) {
            e.preventDefault();
        }
        return false;
    }

    function handleDragEnter(e) {
        this.classList.add('dd-target-over');
    }
    function handleDragLeave(e) {
        this.classList.remove('dd-target-over');
    }

    function handleDrop(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        console.log(e.target.classList);
        // move dragged elem to the selected drop target
        if (e.target.classList.contains("dd-target")) {
            alert('successfull drop to '+ e.target.className);
            e.target.classList.remove('dd-target-over');
        }
    }

    function dragStart(e) {
    }

    function dragEnd(e) {
        ddTarget.classList.remove('dd-target-over');
    }

    btnContainer.dom.addEventListener('dragstart', dragStart);
    btnContainer.dom.addEventListener('dragend', dragEnd);

    ddTarget.addEventListener('dragover', handleDragOver);
    ddTarget.addEventListener('dragenter', handleDragEnter);
    ddTarget.addEventListener('dragleave', handleDragLeave);
    ddTarget.addEventListener('drop', handleDrop);

    let draggableCells = document.querySelectorAll('.frame > div');

    draggableCells.forEach(function (item) {
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragend', dragEnd);
    });


    /**
     * Hover logic
     */
    let canvasParent = document.querySelectorAll('.canvas-parent')[0];

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

    let canvasParentOnMouseMove = function(e) {

        const target = e.target;
        let gapDDRectangle;


        if (!nodeContainsValidGroupCls(target)) {
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
            ddTarget.style.top = rect.top;
            ddTarget.style.left = rect.left;
            ddTarget.style.width = DD_TARGET_WIDTH;
            ddTarget.style.height = rect.bottom - rect.top;
        }
        // Mouse over right inner zone
        else if (e.clientX >= rect.right - DD_TARGET_WIDTH) {
            ddTarget.style.top = rect.top;
            ddTarget.style.left = rect.right - DD_TARGET_WIDTH;
            ddTarget.style.width = DD_TARGET_WIDTH;
            ddTarget.style.height = rect.bottom - rect.top;
        }
        // Mouse over top inner zone
        else if (e.clientY <= rect.top + DD_TARGET_HEIGHT ) {
            ddTarget.style.top = rect.top;
            ddTarget.style.left = rect.left;
            ddTarget.style.width = rect.right - rect.left;
            ddTarget.style.height = DD_TARGET_HEIGHT;
        }
        // Mouse over bottom inner zone
        else if (e.clientY >= rect.bottom - DD_TARGET_HEIGHT) {
            ddTarget.style.top = rect.bottom - DD_TARGET_HEIGHT;
            ddTarget.style.left = rect.left;
            ddTarget.style.width = rect.right - rect.left;
            ddTarget.style.height = DD_TARGET_HEIGHT;
        }
        // Mouse between two row-group childs
        else if(isRowGroupWithFrameSiblings) {
            gapDDRectangle = mouseIsBetweenFrameChilds(target,childGapXs, e.clientX);
            if (gapDDRectangle) {
                ddTarget.style.top = gapDDRectangle.top;
                ddTarget.style.left = gapDDRectangle.left;
                ddTarget.style.width = DD_TARGET_WIDTH;
                ddTarget.style.height = rect.bottom - rect.top;
            }
        }
        // Mouse between two col-group childs
        else if(isColGroupWithFrameSiblings) {
            gapDDRectangle = mouseIsBetweenFrameChilds(target,childGapYs, e.clientY);
            if (gapDDRectangle) {
                ddTarget.style.top = gapDDRectangle.top;
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
        }


    };

    canvasParent.addEventListener('mousemove', canvasParentOnMouseMove);


});