// dataTables Rules JS - Production Version

// Set DataTables global language options with plain UI text (no auto-capitalization)
jQuery.extend(true, jQuery.fn.dataTable.defaults, {
    language: {
        emptyTable: 'No Data Available in the Table',
        info: 'Showing _START_ to _END_ of _TOTAL_ Entries',
        infoEmpty: 'Showing 0 to 0 of 0 Entries',
        infoFiltered: '(Filtered from _MAX_ Total Entries)',
        lengthMenu: 'Show _MENU_ Entries',
        loadingRecords: 'Loading...',
        processing: 'Processing...',
        search: 'Search:',
        zeroRecords: 'No Matching Records Found',
        paginate: {
            first: 'First',
            last: 'Last',
            next: 'Next',
            previous: 'Previous'
        },
        aria: {
            sortAscending: ': Activate to Sort Column Ascending',
            sortDescending: ': Activate to Sort Column Descending'
        }
    }
});

// DOCUMENT READY START
$(document).ready(function(){
    // Custom sort for hh:mm (hours:minutes) format
    jQuery.extend(jQuery.fn.dataTable.ext.type.order, {
        'hhmm-pre': function (d) {
            if (typeof d !== 'string') return 0;
            var parts = d.split(':');
            if (parts.length !== 2) return 0;
            var hours = parseInt(parts[0], 10);
            var minutes = parseInt(parts[1], 10);
            if (isNaN(hours) || isNaN(minutes)) return 0;
            return hours * 60 + minutes;
        }
    });
    // Helper to sync header widths between table and its clone
    function syncHeaderWidths(table, tableClone) {
        table.find('thead th').each(function(index) {
            var width = $(this).width();
            tableClone.find('th').eq(index).width(width);
        });
    }
    // CHECK FOR DATATABLES LIBRARY
    if (!$.fn.DataTable) {
        return;
    }
    
    // Helper: Strip HTML tags for DataTables search/filter
    var stripHtmlRender = {
        targets: '_all',
        render: function (data, type, row) {
            if (type === 'filter' || type === 'search') {
                var div = document.createElement('div');
                div.innerHTML = data;
                return div.textContent || div.innerText || '';
            }
            return data;
        }
    };

    var jobTable = $('#jobTable').DataTable({
        "lengthMenu": [[10, 20, 50, 100, -1], [10, 20, 50, 100, "All"]],
        "pageLength": -1,
        "order": [],
        "columnDefs": [
            { type: 'natural-time-delta', targets: 9 },
            { "orderable": false, "targets": [0, 8, 10] },
            stripHtmlRender
        ]
    });

    // === Sum jobTable Pay Column and display in dataTables Info ===
    function updatePaySum() {
        var col = jobTable && jobTable.column ? jobTable.column(1, {search:'applied'}) : null;
        var data = col && typeof col.data === 'function' ? col.data() : [];
        var arr = (data && typeof data.toArray === 'function') ? data.toArray() : (Array.isArray(data) ? data : []);
        var paySum = arr.length ? arr.reduce(function(a, b) {
            var num = parseFloat(String(b).replace(/[^0-9.\-]+/g, "")) || 0;
            return a + num;
        }, 0) : 0;
        var formatted = paySum.toLocaleString(undefined, {style: 'currency', currency: 'USD'});
        // Remove any previous sum
        $('#jobTable_paginate').prev('.pay-sum').remove();
        // Insert pay sum left-justified before pagination controls
        $('#jobTable_paginate').before('<span class="pay-sum" style="float:left; margin-right:16px; font-weight:bold; white-space:nowrap;">Total Pay: ' + formatted + '</span>');
    }
    jobTable.on('draw', updatePaySum);
    updatePaySum();

    var acTable = $('#acTable').DataTable({
        "lengthMenu": [[10, 20, 50, 100, -1], [10, 20, 50, 100, "All"]],
        "pageLength": -1,
        "order": [[1, 'asc']],
        "columnDefs": [stripHtmlRender]
    });

    var mainACTable = $('#mainACTable').DataTable({
        "lengthMenu": [[10, 20, 50, 100, -1], [10, 20, 50, 100, "All"]],
        "pageLength": -1,
        "responsive": true,
        columnDefs: [
            { responsivePriority: 1, targets: [0, 11] },
            { responsivePriority: 2, targets: 1 },
            { responsivePriority: 10101, targets: [4, 5, 6, 10] },
            { responsivePriority: 10001, targets: [1, 2, 7, 8, 9] },
            stripHtmlRender
        ]
    });
    window.mainACTable = mainACTable; // for toggleLeaseView

    $.fn.dataTable.ext.search.push(
    function(settings, data, dataIndex) {
        if (settings.nTable && settings.nTable.id === 'mainACTable') {
            if (!window.isLeaseOnlyView) return true;
            var row = window.mainACTable.row(dataIndex).node();
            return $(row).hasClass('lease-aircraft');
        }
        return true;
    }
    );

    var payTable = $('#payTable').DataTable({
        "lengthMenu": [[10, 20, 50, 100, -1], [10, 20, 50, 100, "All"]],
        "pageLength": 20,
        "order": [[0, 'dsc']],
        "columnDefs": [stripHtmlRender]
    });

    var saleTable = $('#saleTable').DataTable({
        "lengthMenu": [[10, 20, 50, 100, -1], [10, 20, 50, 100, "All"]],
        "pageLength": -1,
        "order": [[4, 'asc']],
        "columnDefs": [stripHtmlRender]
    });

    var searchTable = $('#searchTable').DataTable({
        "lengthMenu": [[10, 20, 50, 100, -1], [10, 20, 50, 100, "All"]],
        "pageLength": -1,
        "columnDefs": [stripHtmlRender]
    });

    $('#acConfig').DataTable({
      "lengthMenu": [[10, 20, 50, 100, -1], [10, 20, 50, 100, "All"]],
      "pageLength": 20,
      "columnDefs": [stripHtmlRender]
    });

    $('#logTable').DataTable({
      "lengthMenu": [[10, 20, 50, 100, -1], [10, 20, 50, 100, "All"]],
      "pageLength": 20,
      "columnDefs": [stripHtmlRender]
    });

    $('#datafeed').DataTable({
      "bPaginate": false,
      "searching": false,
      "ordering": false,
      infoCallback: function(_, start, end, _, total) {
        // Subtract N from the Total Rows
        var adjustedTotal = total - 2;
        return 'Found ' + adjustedTotal + ' Data Feeds';
      },
      "columnDefs": [stripHtmlRender]
    });

    $('#goodsTable').DataTable({
        "bPaginate": false,
        "ordering": false,
        "searching": false,
        "info": false
    });

    $('#set_length').DataTable({
        "iDisplayLength": 25,
        "columnDefs": [stripHtmlRender]
    });

    $('#search_nopage').DataTable({
        "bAutoWidth": false,
        "bPaginate": false,
        "ordering": false,
        "columnDefs": [stripHtmlRender]
    });

    $('#data_order').DataTable({
        "order": [],
        "columnDefs": [stripHtmlRender]
    });

    $('#no_search').DataTable({
      "searching": false,
      "columnDefs": [stripHtmlRender]
    });

    $('#no_extra').DataTable({
      "bPaginate": false,
      "ordering": false,
      "searching": false,
      "info": false,
      "columnDefs": [stripHtmlRender]
    });

    $('#data_table').dataTable({
        "columnDefs": [stripHtmlRender]
    });

    $('#advanced_example').DataTable({
        footerCallback: function (row, data, start, end, display) {
            var api = this.api(), data;
 
            // Remove the formatting to get integer data for summation
            var intVal = function (i) {
                return typeof i === 'string' ? i.replace(/[$\s,]/g, '') * 1 : typeof i === 'number' ? i : 0;
            };
 
            // Total over this page
            var pageTotal = api
                .column(5, { search:'applied' })
                .data()
                .reduce(function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0);
 
            // Update footer
            $(api.column(5).footer()).html('$' + pageTotal.toLocaleString('en-US'));
        },
        "order": [],
        "columnDefs": [stripHtmlRender]
    });
    
    // Fixed Headers implementation
    setTimeout(function() {
    $('table#jobTable, table#acTable, table#mainACTable, table#searchTable, table#payTable, table#logTable, table#saleTable, table#scoreTable, table#datafeed, table#acConfig').each(function() {
        var table = $(this);
        var tableId = table.attr('id');
        if (table.length === 0 || table.find('thead').length === 0) {
            return;
        }
        var thead = table.find('thead');
        // Determine if wide site mode is enabled
        var isWide = false;
        var mainContentDiv = document.getElementById('mainContentDiv');
        if (mainContentDiv && mainContentDiv.classList.contains('content')) {
            isWide = true;
        }
        var tableWidth = table.width();
        // Only adjust width if in wide mode
        var useAdjustedWidth = (tableId === 'payTable' || (tableId === 'scoreTable' && isWide) || tableId === 'acConfig');
        // Only adjust payTable width if screen is wider than 1920px
        var widthValue;
        if (tableId === 'payTable') {
            if (window.innerWidth < 1921) {
                widthValue = (tableWidth - 15) + 'px';
            } else {
                widthValue = tableWidth + 'px';
            }
        } else if (useAdjustedWidth) {
            widthValue = (tableWidth - 15) + 'px';
        } else {
            widthValue = tableWidth + 'px';
        }
        var tableClone = $('<table></table>')
            .attr('id', 'fixed-' + tableId)
            .addClass(table.attr('class'))
            .addClass('fixed-header-clone'); // Always add the base fixed header class

        // Add a custom class if specified via data-fixed-header-class attribute on the table
        var customFixedHeaderClass = table.data('fixed-header-class');
        // Only add the custom class if not in wide mode
        if (customFixedHeaderClass && !isWide) {
            tableClone.addClass(customFixedHeaderClass);
        }

        tableClone.css({
                'width': widthValue,
                'table-layout': 'fixed',
                'font-size': table.css('font-size'),
                'vertical-align': table.css('vertical-align') || 'middle'
            });
            var theadClone = thead.clone(true);
            theadClone.css({
                'font-size': thead.css('font-size'),
                'vertical-align': thead.css('vertical-align') || 'middle'
            });
            theadClone.find('th').each(function(index) {
                var origTh = thead.find('th').eq(index);
                $(this).css({
                    'font-size': origTh.css('font-size'),
                    'vertical-align': origTh.css('vertical-align') || 'middle',
                    'padding': origTh.css('padding')
                });
            });
            tableClone.append(theadClone);
            var menuHeight = 0;
            if (typeof FSE_HEADER_OFFSET !== 'undefined') {
                menuHeight = FSE_HEADER_OFFSET;
            } else {
                if ($('.main-menu').length) {
                    menuHeight = $('.main-menu').outerHeight();
                } else if ($('nav.navbar').length) {
                    menuHeight = $('nav.navbar').outerHeight();
                } else if ($('#header').length) {
                    menuHeight = $('#header').outerHeight();
                } else {
                    menuHeight = 100;
                }
            }
            var leftOffset = table.offset().left;
            var isWide = false;
            var mainContentDiv = document.getElementById('mainContentDiv');
            if (mainContentDiv && mainContentDiv.classList.contains('content')) {
                isWide = true;
            }
            if (tableId === 'scoreTable' && !isWide) {
                leftOffset = leftOffset - 8;
            }
            var container = $('<div></div>')
                            .attr('id', 'container-fixed-' + tableId)
                            .css({
                                'position': 'fixed',
                                'top': menuHeight + 'px',
                                'left': leftOffset + 'px',
                                'width': widthValue,
                                'z-index': '10000',
                                'display': 'none'
                            })
                .append(tableClone);
            $('body').append(container);
            container.hide();
            // Sync header widths for perfect alignment
            syncHeaderWidths(table, tableClone);
            // Update header widths after DataTables redraws
            if ($.fn.DataTable && $.fn.DataTable.isDataTable(table)) {
                table.on('draw.dt', function() {
                    setTimeout(function() {
                        syncHeaderWidths(table, tableClone);
                    }, 10);
                });
            }
            var updateHeaderVisibility = function() {
                var tableTop = table.offset().top;
                var tableBottom = tableTop + table.height();
                var scrollTop = $(window).scrollTop();
                var headerHeight = table.find('thead').outerHeight();
                var menuOffset = (typeof window.FSE_HEADER_OFFSET !== 'undefined') ? window.FSE_HEADER_OFFSET : 130;
                var delayOffset = 60;
                var adjustedTableTop = tableTop + delayOffset;
                if (scrollTop + menuOffset > adjustedTableTop && scrollTop < tableBottom) {
                    container.show();
                    table.find('thead').css('visibility', 'hidden');
                } else {
                    container.hide();
                    table.find('thead').css('visibility', 'visible');
                }
            };
            $(window).on('scroll', updateHeaderVisibility);
            setTimeout(updateHeaderVisibility, 50);
            $(window).on('resize', function() {
                var newMenuHeight = 0;
                if ($('.main-menu').length) {
                    newMenuHeight = $('.main-menu').outerHeight();
                } else if ($('nav.navbar').length) {
                    newMenuHeight = $('nav.navbar').outerHeight();
                } else if ($('#header').length) {
                    newMenuHeight = $('#header').outerHeight();
                } else {
                    newMenuHeight = 100;
                }
                var leftOffsetResize = table.offset().left;
                var isWideResize = false;
                var mainContentDivResize = document.getElementById('mainContentDiv');
                if (mainContentDivResize && mainContentDivResize.classList.contains('content')) {
                    isWideResize = true;
                }
                if (tableId === 'scoreTable' && !isWideResize) {
                    leftOffsetResize = leftOffsetResize - 8;
                }
                container.css({
                    'top': newMenuHeight + 'px',
                    'left': leftOffsetResize + 'px',
                    'width': (tableId === 'payTable' || tableId === '_scoreTable') ? (table.width() - 15) + 'px' : table.width() + 'px'
                });
                // Sync header widths again on resize
                syncHeaderWidths(table, tableClone);
            });
            container.hide();
        });
    }, 1000);

// Add search persistence for payTable
    // Make sure the table exists and DataTables is loaded
    if ($('#payTable').length && $.fn.DataTable) {
        // Retrieve saved search term
        var savedSearch = localStorage.getItem('payTableSearch');
        // Wait a short moment to ensure DataTable is fully initialized
        setTimeout(function() {
            try {
                var table = $('#payTable').DataTable();
                // Apply saved search if it exists
                if (savedSearch && savedSearch.trim() !== '') {
                    table.search(savedSearch).draw();
                }
                // Listen for search events and save the search term
                $('#payTable_filter input')
                    .val(savedSearch || '') // Set the input value directly
                    .on('keyup search', function() {
                        localStorage.setItem('payTableSearch', $(this).val());
                    });
            } catch (e) {
                // Error applying DataTable search persistence
            }
        }, 200);
    }

    // AJAX DataTables for score.jsp
    if ($('#scoreTable').length) {
        // Determine group mode from a data attribute set in score.jsp
        var group = $('#scoreTable').data('group') === true;

        var columns = [
            { data: 'accountName', title: 'Name' }
        ];
        if (group) {
            columns.push({ data: 'owner', title: 'Owner', defaultContent: '' });
            columns.push({ data: 'money', title: 'Money', className: 'numeric' });
        }

        // Global storage for aircraft data
        window.aircraftModalData = window.aircraftModalData || {};

        // Aircraft column renderer
        function renderAircraftColumn(data, type, row) {
            if (!Array.isArray(data) || data.length === 0) {
                return '<span class="text-muted">No Owned Aircraft</span>';
            }
            if (data.length === 1) {
                var ac = data[0];
                var leaseIndicator = '';
                // Check for lease status and add compact indicator with tooltip
                if (ac.leaseStatus) {
                    var tooltipText = '';
                    var indicatorClass = '';
                    if (ac.leaseStatus === 'leased from' && ac.lessorName) {
                        tooltipText = 'Leased from ' + ac.lessorName;
                        indicatorClass = 'text-primary';
                    } else if (ac.leaseStatus === 'leased to' && ac.lesseeName) {
                        tooltipText = 'Leased to ' + ac.lesseeName;
                        indicatorClass = '';
                    }
                    if (tooltipText) {
                        var style = 'font-weight: bold; cursor: help;';
                        if (ac.leaseStatus === 'leased to' && ac.lesseeName) {
                            style += ' color: #00c851;';
                        }
                        leaseIndicator = ' <span class="' + indicatorClass + '" title="' + tooltipText + '" style="' + style + '"><i class="fa fa-dollar-sign"></i></span>';
                    }
                }
                if (ac.id && ac.id > 0) {
                    return '<a href="aircraftlog.jsp?id=' + ac.id + '">' + ac.registration + '</a> ' + ac.makeModel + leaseIndicator;
                } else {
                    return ac.registration + ' ' + ac.makeModel + leaseIndicator;
                }
            }
            // More than one - show a modal link
            var btnId = 'aircraft-modal-btn-' + Math.random().toString(36).substr(2, 9);
            // Store aircraft data and row data immediately in global object
            window.aircraftModalData[btnId] = {
                aircraft: data,
                ownerName: row.accountName || 'Unknown',
                isGroup: group
            };
            return '<button type="button" id="' + btnId + '" class="view-aircraft-list btn btn-primary btn-xs">View Aircraft (' + data.length + ')</button>';
        }

        columns = columns.concat([
            { data: 'flights', title: 'Flights', className: 'numeric' },
            { data: 'totalMiles', title: 'Miles Flown', className: 'numeric' },
            { data: 'time', title: 'Time Flown', className: 'numeric' },
            { data: 'aircraft', title: 'Owned Aircraft', orderable: false, render: renderAircraftColumn }
        ]);

        // Event delegation for modal (global scope)
        $(document).on('click', '.view-aircraft-list', function(e) {
            e.preventDefault();
            var btnId = $(this).attr('id');
            var modalData = window.aircraftModalData[btnId];
            var aircraft = modalData ? modalData.aircraft : null;
            var ownerName = modalData ? modalData.ownerName : 'Unknown';
            // Utility to decode HTML entities (for owner name only)
            function decodeHtmlEntities(str) {
                var txt = document.createElement('textarea');
                txt.innerHTML = str;
                return txt.value;
            }
            // Update modal title to show owner (decoded)
            $('#aircraftListModalLabel').text('Aircraft Owned by: ' + decodeHtmlEntities(ownerName));
            var $list = $('#aircraftListModalBody');
            $list.empty();
            if (!aircraft || aircraft.length === 0) {
                $list.append('<li class="list-group-item">No Owned Aircraft</li>');
            } else {
                aircraft.forEach(function(ac) {
                    var listItemContent = '';
                    var leaseInfo = '';
                    // Check for lease status and add appropriate information
                    if (ac.leaseStatus) {
                        if (ac.leaseStatus === 'leased from' && ac.lessorName) {
                            leaseInfo = '<br><span class="label label-primary">Leased from ' + ac.lessorName + '</span>';
                        } else if (ac.leaseStatus === 'leased to' && ac.lesseeName) {
                            leaseInfo = '<br><span class="label label-info">Leased to ' + ac.lesseeName + '</span>';
                        }
                    }
                    if (ac.id && ac.id > 0) {
                        listItemContent = '<a href="aircraftlog.jsp?id=' + ac.id + '" class="normal">' + ac.registration + '</a> ' + ac.makeModel + leaseInfo;
                    } else {
                        listItemContent = ac.registration + ' ' + ac.makeModel + leaseInfo;
                    }
                    $list.append('<li class="list-group-item">' + listItemContent + '</li>');
                });
            }
            $('#aircraftListModal').modal('show');
        });

        // Dynamically set the correct target for hh:mm sort type
        var timeFlownTarget = group ? 5 : 3;

        // Initialize DataTable with AJAX
        $('#scoreTable').DataTable({
            ajax: {
                url: 'scoredata.jsp',
                data: { type: group ? 'groups' : '' },
                dataSrc: function(json) {
                    // Custom processing of the AJAX response
                    if (json && json.data) {
                        // Success: return the data array
                        return json.data;
                    }
                    // Error or no data: return empty array
                    return [];
                }
            },
            columns: columns,
            order: [[0, 'asc']],
            "lengthMenu": [[20, 50, 100, 200, 500], [20, 50, 100, 200, 500]],
            "pageLength": 20,
            "columnDefs": [
                { type: 'hhmm', targets: timeFlownTarget },
                stripHtmlRender,
                { className: "nowrap", targets: "_all" }
            ],
            initComplete: function(settings, json) {
                if(json && json.error) {
                    $('#scoreTable tbody').html('<tr><td colspan="'+columns.length+'">Server Error: ' + json.error + '</td></tr>');
                } else if(json && json.status === 'generating') {
                    $('#scoreTable tbody').html('<tr><td colspan="'+columns.length+'">Statistics Still Being Generated</td></tr>');
                }
                // Initialize tooltips for lease indicators
                $('#scoreTable').find('[title]').tooltip();
            },
            drawCallback: function() {
                // Re-initialize tooltips after each draw/page change
                $('#scoreTable').find('[title]').tooltip();
            }
        });
    }
});

