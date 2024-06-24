import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getPersonalLoanPlans from '@salesforce/apex/EMIDetailsController.getPersonalLoanPlans';
import createSelectedPlan from '@salesforce/apex/EMIDetailsController.createSelectedPlan';

export default class AcceptEMI extends LightningElement {
    @api recordId; // Loan Application Record ID
    @api sanctionedAmount = 50000; // Example amount, can be dynamically set
    @track loanPlans = [];
    @track selectedPlan = null;
    @track showPlans = false;
    @track showModal = false;

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
                })
                .catch(error => {
                    console.error('Error on accept plan:', error); // Debugging log
                    this.showErrorToast(error);
                });
        } else {
            this.showErrorToast('No plan selected.');
        }
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



    handleAccept() {
        this.showModal = true;     
    }

    handleDecline() {
        this.showModal = false;
    }     
}