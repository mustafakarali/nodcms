(function ($) {
    $.fn.inputImageLibrary = function () {
        var $this = $(this);
        $this.change(function () {
            if($this.val()!=''){
                $($this.data('target')).attr('src', $('body').data('base-url')+$this.val());
            }else{
                $($this.data('target')).attr('src', $($this.data('target')).data('preview'));
            }
        });
        return this;
    };
}(jQuery));

$(function(){
    $('input[role="image-library"]').each(function () {
        $(this).inputImageLibrary();
    });
});
