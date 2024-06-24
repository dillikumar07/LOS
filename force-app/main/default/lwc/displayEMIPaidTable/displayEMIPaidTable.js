import { LightningElement, track, wire } from 'lwc';
import getAllTransactions from '@salesforce/apex/DisplayTable.getAllTransactions';
import sendInvoice from '@salesforce/apex/DisplayTable.getAllTransactions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DisplayEMIPaidTable extends LightningElement {
    @track transactions = [];

    @wire(getAllTransactions)
    wiredTransactions({ error, data }) {
        if (data) {
            this.transactions = data;
            console.log('Transactions:', this.transactions);
        } else if (error) {
            this.showToast('Error', 'Error retrieving transaction records', 'error');
        }
    }

    handleSendInvoice(event) {
        const transactionId = event.target.dataset.id;
        sendInvoice({ transactionId: transactionId })
            .then(() => {
                this.showToast('Success', 'Invoice sent successfully', 'success');
            })
            .catch(error => {
                this.showToast('Error', 'Error sending invoice', 'error');
            });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}