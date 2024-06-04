export default{
    async fetch(data,payment_mode,invoiceUrl){
        try {
            await fetch('https://YOUR-EXPRESS-SERVER-DOMAIN/api/create/transaction',{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization':'Your-API-Token-For-Express-Server'
                },
                body:JSON.stringify({
                    id: String(data.id),
                    date: String(data.date),
                    email: String(data.email),
                    mode: String(payment_mode),
                    amount: data.amount,
                    url: invoiceUrl
                })
            })
        }
        catch(error) {
            return 0
            }
    },
}
