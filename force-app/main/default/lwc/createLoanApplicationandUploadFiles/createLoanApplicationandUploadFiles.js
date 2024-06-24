
import { LightningElement, api, track } from 'lwc';
import saveFiles from '@salesforce/apex/LoanApplicationController.saveFiles';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createLoanApplication from '@salesforce/apex/LoanApplicationController.createLoanApplication';

export default class CreateLoanApplicationandUploadFiles extends LightningElement {
    
    @track filesToUpload = [];
    @track loanApplicationName = '';
    @track loanType = '';
    @track amount = null;
    @track showModal = false;
    @track loanApplicationId = null;
    @track loanDocumentId = null;
    
    loanTypeOptions = [
        { label: 'Personal Loan', value: 'Personal Loan' },
        { label: 'Vehicle Loan', value: 'Vehicle Loan' }
    ];

    get isPersonalLoan() {
        return this.loanType === 'Personal Loan';
    }

    get isVehicleLoan() {
        return this.loanType === 'Vehicle Loan';
    }

    handleFileChange(event) {
        const files = event.detail.files;
        this.filesToUpload = [...this.filesToUpload, ...files];
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleSave() {
        if (this.validateForm()) {
            // First, create the loan application
            createLoanApplication({ loanApplicationName: this.loanApplicationName, loanType: this.loanType, amount: this.amount })
                .then(result => {
                    // Store the returned loan application Id and loan document Id
                    this.loanApplicationId = result.loanApplicationId;
                    this.loanDocumentId = result.loanDocumentId;
                    console.log('Loan Application ID:', this.loanApplicationId);
                    console.log('Loan Document ID:', this.loanDocumentId);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Loan Application created successfully',
                            variant: 'success'
                        })
                    );

                    // Proceed to upload files after loan application creation
                    return this.uploadFiles();
                })
                .then(() => {
                    // All operations successful, close the modal and reset the form
                    this.dispatchEvent(new CustomEvent('close'));
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Files uploaded successfully',
                            variant: 'success'
                        })
                    );
                    this.resetForm();
                })
                .catch(error => {
                    // Handle any errors during loan application creation or file upload
                    console.error('Error:', error);
                    let errorMessage = 'An error occurred';
                    if (error.body) {
                        errorMessage = error.body.message || error.body.errorMessage || errorMessage;
                    } else if (error.message) {
                        errorMessage = error.message;
                    }
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: errorMessage,
                            variant: 'error'
                        })
                    );
                });
        }
        this.showModal = false;
    }
    
    // Helper method to upload files
    uploadFiles() {
        const documentIds = this.filesToUpload.map(file => file.documentId);
        console.log('Loan Document ID:', this.loanDocumentId);
        return saveFiles({ documentIds, loanDocumentId: this.loanDocumentId });
    }

    handleChange(event) {
        const { name, value } = event.target;
        if (name === 'loanApplicationName') {
            this.loanApplicationName = value;
        } else if (name === 'loanType') {
            this.loanType = value;
        } else if (name === 'amount') {
            this.amount = value;
        }
    }

    handleSubmit() {
        // Your handleSubmit logic here
    }

    handleApplyLoan() {
        this.showModal = true;
    }

    handleCloseModal() {
        this.showModal = false;
    }

    validateForm() {
        let isValid = true;

        if (!this.loanApplicationName) {
            isValid = false;
            this.showErrorMessage('Please enter the Loan Application Name.');
        }

        if (!this.loanType) {
            isValid = false;
            this.showErrorMessage('Please select the Loan Type.');
        }

        if (!this.amount || isNaN(this.amount) || Number(this.amount) <= 0) {
            isValid = false;
            this.showErrorMessage('Please enter a valid Amount.');
        }

        return isValid;
    }

    showErrorMessage(message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: message,
                variant: 'error'
            })
        );
    }

    resetForm() {
        this.loanApplicationName = '';
        this.loanType = '';
        this.amount = null;
        this.template.querySelector('[name="loanApplicationName"]').value = '';
        this.template.querySelector('[name="loanType"]').value = '';
        this.template.querySelector('[name="amount"]').value = '';
    }
}
