var regex = {
    email: /^[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z0-9.-]+$/i, //http://regexlib.com/REDetails.aspx?regexp_id=5011
    name: /^[A-Za-z0-9_]{3,20}$/, //http://www.9lessons.info/2009/03/perfect-javascript-form-validation.html
    password: /.{8,}/
};
$(document).ready(function (){
    (function() {
        $('form > input').keyup(function() {
    
            var empty = false;
            $('form > input').each(function() {
                if ($(this).val() == '') {
                    empty = true;
                }
            });
    
            if (empty) {
                $('#register').attr('disabled', 'disabled'); // updated according to http://stackoverflow.com/questions/7637790/how-to-remove-disabled-attribute-with-jquery-ie
            } else {
                $('#register').removeAttr('disabled'); // updated according to http://stackoverflow.com/questions/7637790/how-to-remove-disabled-attribute-with-jquery-ie
            }
        });
    })()
});