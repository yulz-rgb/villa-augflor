/** Safe fallback while 2027 inventory/rates and a dependable enquiry backend are unconfirmed. */
'use strict';
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed'});}
 return res.status(200).json({reply:'For summer 2027, please send Lana your arrival and departure dates and the number of adults and children. Lana will confirm availability and provide a full written quote. This assistant cannot hold dates, confirm a reservation or accept payment.',action:'whatsapp'});
};
