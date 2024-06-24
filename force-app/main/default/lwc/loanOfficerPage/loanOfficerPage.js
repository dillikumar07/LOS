

import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getPersonalLoans from '@salesforce/apex/loanOfficerController.getPersonalLoans';
import getVehicleLoans from '@salesforce/apex/loanOfficerController.getVehicleLoans';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
//import sendEmail from '@salesforce/apex/LoanOfficerController.sendEmail';

export default class LoanOfficerPage extends NavigationMixin(LightningElement) {
    // Define your properties and variables here
    @track personalLoans;
    @track vehicleLoans;
    @track wiredPersonalLoansResult;
    @track wiredVehicleLoansResult;
    @track personalVerificationStatus = '';
    @track vehicleVerificationStatus = '';
    @track showRejectionModal = false;
    @track selectedLoanId;
    @track rejectionReason = '';
    @track showBackdrop = false;
    statusOptions = [
        { label: 'All', value: '' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Verified', value: 'Verified' },
        { label: 'Rejected', value: 'Rejected' }
    ];
    verificationOptions = [
        { label: 'Verified', value: 'Verified' },
        { label: 'Rejected', value: 'Rejected' }
    ];

    // Load personal loans
    @wire(getPersonalLoans, { verificationStatus: '$personalVerificationStatus' })
    wiredPersonalLoans(result) {
        this.wiredPersonalLoansResult = result;
        if (result.data) {
            console.log("data",this.data);
            this.personalLoans = result.data.map(record => ({ ...record }));
            console.log("Personal Loans : ", this.personalLoans);
        } else if (result.error) {
            console.error(result.error);
        }
    }

    // Load vehicle loans
    @wire(getVehicleLoans, { verificationStatus: '$vehicleVerificationStatus' })
    wiredVehicleLoans(result) {
        this.wiredVehicleLoansResult = result;
        if (result.data) {
            this.vehicleLoans = result.data.map(record => ({ ...record }));
            console.log("Vehicle Loans : ", this.vehicleLoans);
        } else if (result.error) {
            console.error(result.error);
        }
    }

    // Handle change in personal loan status
    handlePersonalStatusChange(event) {
        const recordId = event.target.name;
        const newStatus = event.target.value;
        this.selectedLoanId = recordId;
        if (newStatus === 'Rejected') {
            this.showRejectionModal = true;
            this.updateLoanStatus(recordId, newStatus);
        } else {
            this.updateLoanStatus(recordId, newStatus);
        }
    }

    // Handle change in vehicle loan status
    handleVehicleStatusChange(event) {
        const recordId = event.target.name;
        const newStatus = event.target.value;
        this.selectedLoanId = recordId;
        if (newStatus === 'Rejected') {
            this.showRejectionModal = true;
            this.updateLoanStatus(recordId, newStatus);
        } else {
            this.updateLoanStatus(recordId, newStatus);
        }
    }

    // Update loan status
    updateLoanStatus(recordId, newStatus) {
        const recordInput = {
            fields: {
                Id: recordId,
                Approval_Status_By_Loan_Officer__c: newStatus
            }
        };

        updateRecord(recordInput)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record updated',
                        variant: 'success'
                    })
                );
                this.refreshData();
            })
            .catch(error => {
                console.error(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error updating record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }

    // Refresh loan data
    refreshData() {
        refreshApex(this.wiredPersonalLoansResult);
        refreshApex(this.wiredVehicleLoansResult);
    }

    // Handle close modal
    handleCloseModal() {
        this.showRejectionModal = false;
        this.rejectionReason = '';
    }

    // Handle rejection reason change
    handleRejectionReasonChange(event) {
        this.rejectionReason = event.target.value;
    }

    
    /*handleSendEmail() {
        // Call the Apex method to send the email
        sendEmail({ loanId: this.selectedLoanId, rejectionReason: this.rejectionReason })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Email sent successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                console.error(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error sending email',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
        
        // Close the modal after sending email
        this.showRejectionModal = false;
        this.rejectionReason = '';
    }*/
    handleViewDocuments(event) {
        const recordId = event.target.dataset.id;
        console.log('Document Id :',recordId);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view',
            },
            state: {
                navigationLocation: 'RELATED_LIST',
                objectApiName: 'Loan_Documents__c',
                relatedListApiName: 'CombinedAttachments',
            },
        });
    }

}