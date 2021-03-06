(function ( $ ) {
    $.fn.nodcmsNetstable = function () {
        var $list = $(this),
            $saveBtn = $($list.data('save-btn')),
            $visibilityBtn = $($list.data('visibility-btn')),
            $output = $list.find('.sort-text-output'),
            maxDepth;
        var updateOutput = function (e) {
            var list = e.length ? e : $(e.target);
            // Update new sort in out-put textarea
            if (window.JSON) {
                $output.val(window.JSON.stringify(list.nestable('serialize'))); //, null, 2));
                $saveBtn.removeClass('hidden');
            } else {
                toastr.error('JSON browser support required for this action.', 'Error');
            }
        };

        $saveBtn.click(function() {
            var saveSortBtn = $(this);
            var output = $list.find('.sort-text-output');
            $.ajax({
                url: saveSortBtn.data('url'),
                data: {'data':output.val()},
                type:'post',
                dataType: 'json',
                beforeSend: function () {
                    saveSortBtn.attr('disabled','disabled').addClass('disabled').prepend($("<i class='fas fa-spinner fa-pulse fa-fw'></i>"));
                },
                complete:function () {
                    saveSortBtn.removeAttr('disabled').removeClass('disabled').find('i.fas.fa-spinner').remove();
                },
                success: function (resullt) {
                    if(resullt.status=='error') {
                        toastr.error(resullt.error, translate('Error'));
                    }else if(resullt.status=='success'){
                        output.addClass('hidden').val('');
                        saveSortBtn.addClass('hidden');
                        toastr.success(resullt.msg, translate('Success'));
                    }
                },
                error: function (xhr, status, error) {
                    $.showInModal(translate('Error')+': '+translate('Ajax failed!'), '<div class="alert alert-danger">' +
                        '<h4>'+translate('Error')+'</h4>' +
                        error +
                        '</div>' +
                        '<h4>'+translate('Result')+'</h4>' +
                        xhr.responseText);
                }
            });
        });

        $visibilityBtn.click(function () {
            var $parent = $(this).parents('.dd-item');
            var visibility = $parent.data('public'), new_value = visibility==1?0:1;
            // Toggle visibility sign and value
            $parent.attr('data-public', new_value).data('public', new_value);
            $(this).find('i').toggleClass('fa-eye fa-eye-slash');

            $.ajax({
                url: $(this).data('href'),
                data: {'data':visibility},
                method:'post',
                dataType: 'json',
                success: function (resullt) {
                    if(resullt.status=='error'){
                        // Toggle back visibility sign and value
                        $parent.attr('data-public', value).data('public', value);
                        $(this).find('i').toggleClass('fa-eye fa-eye-slash');
                        toastr.error(resullt.error, translate("Error"));
                    }
                },
                error:function () {
                    // Toggle back visibility sign and value
                    $parent.attr('data-public', value).data('public', value);
                    $(this).find('i').toggleClass('fa-eye fa-eye-slash');
                    toastr.error('Ajax request fail!', translate("Error"));
                }
            });
        });

        if(typeof $list.data('max-depth')!== undefined){
            $list.nestable({
                maxDepth: $list.data('max-depth')
            }).on('change', updateOutput);
        }else{
            $list.nestable().on('change', updateOutput);
        }
    };
}( jQuery ));
$(function () {
    $('.nodcms-sortable-list').nodcmsNetstable();
});