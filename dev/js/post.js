/*eslint-disable no-undef */
$(function(){

 //clear styles
$('.post-form input, #post-body').on('focus', function(){
    $('.add-post p.error').remove();
    $('.post-form #post-body, .post-form input').removeClass('error');
 })
 
 //publish
 $('.publish-button, .save-button').on('click', function(e){
    e.preventDefault();
   
     var isDraft = 
     $(this)
     .attr('class')
     .split(' ')[0] === 'save-button';
     
    var data ={
        title:$('#post-title').val(),
        body: $('#post-body').val(),
        isDraft: isDraft,
        postId:$('#post-id').val()
    };
     $.ajax({
         type:'POST',
         data: JSON.stringify(data),
         contentType:'application/json',
         url:'/post/add'
     }).done(function(data){
         console.log(data);
         if(!data.ok){
         $('.post-form h2').after('<p class="error">' + data.error + '</p>');
         if(data.fields){
              data.fields.forEach(function(item){
                  $('#post-'+item).addClass('error');
              })
            }
        } else {
             if(isDraft){
                $(location).attr('href', '/post/edit/'+ data.post.id);
             }else{
                $(location).attr('href','/posts/'+data.post.url);
             }
             // $('.register h2').after('<p class="success">Отлично! </p>');
             // $(location).attr('href', '/');
         }
     });
 });

 //upload
  $('#file').on('change', function(e){
    //  e.preventDefault();
      var formData = new FormData();
      formData.append('postId',$('#post-id').val());
      formData.append('file',$('#file')[0].files[0]);
      console.log(formData)
      
      $.ajax({
          type:'POST',
          url:'/upload/image',
          data: formData,
          processData: false,
          contentType: false,
          success: function(data){
              console.log(data);
              $('#fileinfo').prepend('<div class="img-container"><img src="/uploads'+data.filePath+'" alt=""></div>')
          },
          error: function(e){
              console.log(e);
          }
      })
  })
  //inserting image
  $('.img-container').on('click', function(){
      var imageId = $(this).attr('id');
      var txt = $('#post-body');
      var caretPos= txt[0].selectionStart;
      var textAreaTxt = txt.val();
      var txtToAdd = '![alt text](image'+imageId+')';
      txt.val(textAreaTxt.substring(0, caretPos)+txtToAdd + textAreaTxt.substring(caretPos));
  })

});
/*eslint-unable no-undef */
