import {Worker} from 'bullmq'
import { sendApprovalEmail,sendCancellationEmail } from '../utils/mailer.js'

const connection = {
    url :process.env.REDIS_URL || 'redis://localhost:6379'
}

const emailWorker =new Worker(
    'email-queue',
    async (job)=>{
        const {type,appointment}=job.data;
        console.log(`Processing background email job [${job.id}] - Type: ${type}`);

        if(type ==='APPROVAL'){
            await sendApprovalEmail(appointment)
        }else if(type ==='REJECTED'){
            await sendCancellationEmail(appointment);
        }
    },
    {connection}
);

emailWorker.on('completed',(job)=>{
    console.log(`Email job ${job.id} completed successfully!`);
});
emailWorker.on('failed',(job,err)=>{
    console.error(`Email job ${job.id}failed`,err.message);
});