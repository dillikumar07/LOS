import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getPersonalLoanPlans from '@salesforce/apex/EMIDetailsController.getPersonalLoanPlans';
import createSelectedPlan from '@salesforce/apex/EMIDetailsController.createSelectedPlan';
import getSanctionedAmount from '@salesforce/apex/LoanApplicationController.getSanctionedAmount';
import deleteLoanApplication from '@salesforce/apex/LoanApplicationController.deleteLoanApplication'; // Import the delete method

export default class AcceptEMI1 extends LightningElement {
    @api recordId; // Loan Application Record ID
    @track sanctionedAmount; // Dynamically set sanctioned amount
    @track loanPlans = [];
    @track selectedPlan = null;
    @track showPlans = false;
    @track showModal = false;
    @track showConfirmationPage = true; // Page to confirm sanction amount
    @track showThankYouPage = false; // Thank you page after accepting or declining

    connectedCallback() {
        // Check local storage to determine if the user has already accepted or declined the EMI plan
        const loanStatus = localStorage.getItem(`loanStatus_${this.recordId}`);
        if (loanStatus === 'accepted') {
            this.showConfirmationPage = false;
            this.showThankYouPage = true;
        } else if (loanStatus === 'declined') {
            this.showConfirmationPage = false;
            this.showThankYouPage = false;
        }
    }

    // Wire the sanctioned amount method
    @wire(getSanctionedAmount)
    wiredSanctionedAmount({ error, data }) {
        if (data) {
            this.sanctionedAmount = data;
        } else if (error) {
            console.error('Error retrieving sanctioned amount:', error);
            this.showErrorToast(error);
        }
    }

    @wire(getPersonalLoanPlans, { sanctionedAmount: '$sanctionedAmount' })
    wiredPersonalLoanPlans({ error, data }) {
        if (data) {
            console.log('Data received:', data); // Debugging log
            try {
                this.loanPlans = JSON.parse(data); // Parse the string data into JSON
                this.showPlans = true;
            } catch (e) {
                console.error('Error parsing data:', e);
                this.showErrorToast({ body: { message: 'Error parsing loan plans data.' } });
            }
        } else if (error) {
            console.error('Error received:', error); // Debugging log
            this.showErrorToast(error);
        }
    }

    handlePlanSelection(event) {
        const planId = event.target.dataset.id;
        this.selectedPlan = this.loanPlans.find(plan => plan.loanTenureYears == planId);
        console.log('Selected Plan:', this.selectedPlan); // Debugging log
    }

    handleAcceptPlan() {
        this.showModal = false;
        if (this.selectedPlan) {
            const selectedPlanJson = JSON.stringify(this.selectedPlan); // Serialize the selected plan
            createSelectedPlan({ selectedPlanJson: selectedPlanJson })
                .then(result => {
                    this.showSuccessToast('Plan accepted successfully.');
                    this.showConfirmationPage = false; // Hide the confirmation page
                    this.showThankYouPage = true; // Show thank you page
                    localStorage.setItem(`loanStatus_${this.recordId}`, 'accepted'); // Store state in local storage
                })
                .catch(error => {
                    console.error('Error on accept plan:', error); // Debugging log
                    this.showErrorToast(error);
                });
        } else {
            this.showErrorToast('No plan selected.');
        }
    }

    handleAccept() {
        this.showModal = true;
    }

    handleDecline() {
        deleteLoanApplication({ loanApplicationId: this.recordId })
            .then(() => {
                this.showSuccessToast('Loan application declined and deleted successfully.');
                this.showConfirmationPage = false; // Hide the confirmation page
                this.showThankYouPage = false; // Hide the thank you page
                localStorage.removeItem(`loanStatus_${this.recordId}`); // Remove state from local storage
            })
            .catch(error => {
                console.error('Error on decline:', error); // Debugging log
                this.showErrorToast(error);
            });
    }

    handleClose() {
        this.showModal = false;
    }

    showSuccessToast(message) {
        const event = new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: 'success'
        });
        this.dispatchEvent(event);
    }

    showErrorToast(error) {
        const event = new ShowToastEvent({
            title: 'Error',
            message: error.body.message,
            variant: 'error'
        });
        this.dispatchEvent(event);
    }
}
