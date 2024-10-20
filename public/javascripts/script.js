function addToCart(proId){
    $.ajax({
        url:'/user/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $("#cart-count").html(count)
                location.reload()
            }else {
                window.location.href = '/user/login'; // Ensure this URL is correct
            }
        }
    })
}