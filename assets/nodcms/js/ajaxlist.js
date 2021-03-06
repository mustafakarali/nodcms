(function ( $ ) {
    $.fn.ajaxList = function ($options) {
        var settings = $.extend({
            type: 'ajax',
            data: null,
            listID: '',
            ajaxURL: null,
            ajaxMethod: null,
            ajaxData: null,
            loadType: 'pagination',
            listType: 'table',
            headers: null,
            listClass: 'table',
            callback_rows: {},
            page: 1,
        }, $options);

        if (settings.headers == null) {
            alert('ajaxList ERROR');
            console.log('ajaxList ERROR: settings.listID contains null. Please set an ID for your list');
            return $(this);
        }
        if (settings.headers == null) {
            alert('ajaxList ERROR');
            console.log('ajaxList ERROR: settings.headers contains null');
            return $(this);
        }
        if (settings.type == 'static' && settings.data == null) {
            alert('ajaxList ERROR');
            console.log('ajaxList ERROR: settings.data contains null');
            return $(this);
        }
        if (settings.type == 'ajax' && settings.ajaxURL == null) {
            alert('ajaxList ERROR');
            console.log('ajaxList ERROR: settings.ajaxUrl contains null');
            return $(this);
        }
        return this.each(function() {
            var $this = $(this), current_content = $this.html();

            /**
             * Set headers as table headers
             *
             * @returns {string}
             */
            function table_headers() {
                var list_headers = settings.headers;
                var html_result = '<tr id="' + settings.listID + '_headers' + '">';
                $.each(list_headers, function (key, item) {
                    html_result += '<th id="' + settings.listID + '_header_' + key + '">' + item.label + '</th>';
                });
                return html_result;
            }

            /**
             * Set data as table rows
             *
             * @returns {string}
             */
            function table_rows(data) {
                var html_result = '';
                $.each(data, function (key, value) {
                    var row_class = value.row_class;
                    if (value.row_bold == 1)
                        row_class += ' font-weight-bold';
                    html_result += '<tr id="' + value.row_id + '" class="' + row_class + ' normal-table-rows">';
                    $.each(value.columns, function (index, item) {
                        html_result += '<td>' + item.content + '</td>';
                    });
                    html_result += '</tr>';
                });
                return html_result;
            }

            function table_empty_row(){
                return '<tr class="empty-row"><td colspan="'+settings.headers.length+'" class="text-center">' +
                '<div class="alert alert-info">' +
                '<p>'+translate('Empty table result.')+'</p>' +
                '</div> ' +
                '</td></tr>';
            }

            $.fn.tableReload = function()
            {
                var $this = $(this);
                $this.loadTableData($this.data('page'));
            };

            $.fn.contentReload = function () {
                var $this = $(this);
                if(settings.listType == 'table'){
                    var html_result = '<div class="table-responsive"><table class="'+settings.listClass+'">';
                    html_result += table_headers();
                    if(settings.type=="static"){
                        var table_content_rows = table_rows(settings.data);
                        if(table_content_rows!=''){
                            html_result += table_content_rows;
                        }else{
                            html_result += table_empty_row();
                        }
                    }
                    html_result += "</table></div>";
                    $this.html($(html_result));
                    if(settings.type=="ajax") {
                        $this.loadTableData(settings.page);
                    }
                    return $this;
                }
                $this.html($('<p>Undefined listType</p>'));
            };

            $.fn.setAjaxData = function (ajaxData) {
                settings.ajaxData = ajaxData;
                $(this).contentReload()
            };

            $.fn.handlePagination = function (page, pages) {
                $.fn.createPagination = function (start, end) {
                    var $pagination = $(this);
                    $pagination.data('start', start);
                    $pagination.data('end', end);
                    for(var i=start;i<=end;i++){
                        var $liElement = $('<li><a class="pagination-number" data-page="'+i+'" href="javascript:;">'+i+'</a></li>');
                        $liElement.find('a').click(function () {
                            $(this).addClass('disabled').prepend($('<i class="fa fa-spinner fa-pulse loading"></i> '));
                            $this.loadTableData($(this).data('page'));
                        });
                        $pagination.append($liElement);
                    }

                    if(pages>5){
                        if(start>=page-2){
                            $liElement = $('<li><a class="pagination-first" data-page="1" href="javascript:;"><i class="fa fa-angle-double-left"></i></a></li>');
                            $pagination.prepend($liElement);
                        }
                        if(end<=pages){
                            $liElement = $('<li><a class="pagination-last" data-page="'+pages+'" href="javascript:;"><i class="fa fa-angle-double-right"></i></a></li>');
                            $pagination.append($liElement);
                        }
                    }
                    $pagination.find('li a[data-page="'+page+'"]').parent().addClass('active');
                };

                var start_page,end_page;
                if(pages<=5){
                    start_page = 1;
                    end_page = pages;
                }else{
                    if(page<=3){
                        start_page = 1;
                        end_page = 5;
                    }else if(page>=pages-2) {
                        start_page = pages - 4;
                        end_page = pages;
                    }else{
                        start_page = pages - 2;
                        end_page = pages + 2;
                    }
                }

                if($this.find('.pagination').length==0 && pages>1){
                    var $pagination = $('<ul class="pagination"></ul>');
                    $pagination.createPagination(start_page,end_page);
                    $this.append($pagination);
                }else{
                    $this.find('.pagination').html('').createPagination(start_page,end_page);
                }
            };

            $.fn.loadTableData = function (page) {
                var $this = $(this);
                $.ajax({
                    url:settings.ajaxURL+'/'+page,
                    method:settings.ajaxMethod,
                    data:settings.ajaxData,
                    dataType:"json",
                    beforeSend:function () {
                        var $loadingRow = $('<tr class="loading-row"><td colspan="'+settings.headers.length+'" class="text-center"><i class="fa fa-spinner fa-pulse"></i></td></tr>');
                        $loadingRow.appendTo($this.find('table'));

                        $this.find('.empty-row').remove();
                        if(settings.loadType == 'pagination') {
                            $this.find('.normal-table-rows').addClass('old-table-rows');
                        }
                    },
                    complete:function () {
                        $this.find('.loading-row').remove();
                    },
                    success:function (result) {
                        if(result.status == 'success'){
                            $this.data('page',page);
                            var my_table_rows = table_rows(result.data.result);
                            $this.find('table').append($(my_table_rows));
                            if(settings.loadType == 'pagination'){
                                if(result.data.result.length == 0){
                                    var $loadingRow = $(table_empty_row());
                                    $loadingRow.appendTo($this.find('table'));
                                }
                                $this.find('.old-table-rows').remove();
                                $this.handlePagination(result.data.page, result.data.pages);
                            }
                            $this.handleRemoveBtn();
                            $this.handleDeleteBtn();
                            return;
                        }
                        toastr.error(result.error, translate('Error'));
                    },
                    error: function (xhr, status, error) {
                        console.log(xhr.responseText);
                        toastr.error(translate('Send form with ajax failed!'), translate('Error'));
                    }
                });
            };

            $.fn.resetTableData = function (data) {
                var $this = $(this);
                var my_table_rows = table_rows(data);
                $this.find('table').append($(my_table_rows));
                if(settings.loadType == 'pagination'){
                    if(result.data.result.length == 0){
                        var $loadingRow = $(table_empty_row());
                        $loadingRow.appendTo($this.find('table'));
                    }
                    $this.find('.old-table-rows').remove();
                    $this.handlePagination(result.data.page, result.data.pages);
                }
                $this.handleRemoveBtn();
                $this.handleDeleteBtn();
            };

            $.fn.handleRemoveBtn = function () {
                var $this = $(this);
                $.fn.ajaxProcess = function () {
                    var $thisBtn = $(this);
                    $.ajax({
                        url:$thisBtn.data('url'),
                        dataType:"json",
                        beforeSend:function () {
                            $thisBtn.addClass('disabled').prepend($('<i class="fa fa-spinner fa-pulse"></i>'));
                        },
                        complete:function () {
                            $thisBtn.removeClass('disabled').find('.fa.fa-spinner').remove();
                        },
                        success:function (result) {
                            if(result.status == 'success'){
                                $($thisBtn.data('reference')).remove();
                                $this.tableReload();
                                return;
                            }
                            toastr.error(result.error, translate('Error'));
                        },
                        error: function (xhr, status, error) {
                            console.log(xhr.responseText);
                            toastr.error(translate('Send form with ajax failed!'), translate('Error'));
                        }
                    });
                };
                $this.find('button[data-role="remove"]').each(function () {
                    var $thisBtn = $(this);
                    if($thisBtn.hasClass('btn-ask')){
                        $thisBtn.on('confirmed.bs.confirmation', function () {
                            $thisBtn.ajaxProcess();
                        });
                        $thisBtn.makeConfirmationBtn();
                    }else{
                        $thisBtn.click(function () {
                            $thisBtn.ajaxProcess();
                        });
                    }
                });
            };
            $.fn.handleDeleteBtn = function () {
                var $this = $(this);
                $this.find('button[data-role="delete"]').click(function () {
                    var $thisBtn = $(this);
                    $.loadConfirmModal($thisBtn.data('url'), function (result, myModal) {
                        $($thisBtn.data('reference')).remove();
                        $this.tableReload();
                        myModal.modal('hide');
                    })
                });
            };

            $this.contentReload();
        });
    }
}( jQuery ));
