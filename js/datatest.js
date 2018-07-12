var d;

$(document).ready(function(){
    $.ajax({
        url: 'data/extracted.json',
        dataType: 'json',
        success: function(j){
            d = j;
            console.log('loaded data!');
        }
    });
});