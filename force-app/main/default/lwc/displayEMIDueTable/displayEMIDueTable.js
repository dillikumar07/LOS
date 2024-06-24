
import { LightningElement, track, wire } from 'lwc';
import getAllEMIs from '@salesforce/apex/DisplayTable.getAllEMIs';
import updateEMIRecord from '@salesforce/apex/DisplayTable.updateEMIRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class DisplayEMIDueTable extends LightningElement {
    @track personalLoanRecords = [];
    @track vehicleLoanRecords = [];
    wiredEmiData;

    @wire(getAllEMIs)
    wiredEMIs(value) {
        this.wiredEmiData = value;
        console.log("EMi Due",this.wiredEmiData);
        const { error, data } = value;
        if (data) {
            
            this.personalLoanRecords = data.filter(emi => emi.Loan_Application__r.Loan_Type__c === 'Personal Loan');
            this.vehicleLoanRecords = data.filter(emi => emi.Loan_Application__r.Loan_Type__c === 'Vehicle Loan');
        } else if (error) {
            this.showToast('Error', 'Error retrieving EMI records', 'error');
        }
    }

    handlePay(event) {
        const emiId = event.target.dataset.id;
        updateEMIRecord({ emiId })
            .then(() => {
                this.showToast('Success', 'EMI payment processed', 'success');
                window.location.href = 'https://www.sandbox.paypal.com/ncp/payment/28QRWDEMV2AZQ';
            })
            .catch(error => {
                this.showToast('Error', 'Error processing EMI payment', 'error');
                console.error(error);
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