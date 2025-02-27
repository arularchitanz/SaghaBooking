import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './form-component.html',
  styleUrls: ['./form-component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FormComponent {
  bookingForm: FormGroup;
  isLoggedIn: boolean = false;
  selectedService: string = 'local';
  googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfZloSAtQKDW883J-Xn3cFBeRYpJOHFjowTZORNlpVAC6cbAQ/formResponse';

  constructor(private fb: FormBuilder) {
    this.bookingForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      phoneNo: ['', [
        Validators.required, 
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      travelDate: ['', Validators.required],
      pickupAddress: ['', Validators.required],
      dropAddress: ['', Validators.required],
      noOfPassengers: ['', [
        Validators.required, 
        Validators.min(1),
        Validators.pattern('^[0-9]*$')
      ]],
      selectVehicle: ['', Validators.required],
      vehicleType: ['', Validators.required],
      remarks: [''],
      serviceType: [this.selectedService]
    });
  }

  login() {
    this.isLoggedIn = true;
  }

  logout() {
    this.isLoggedIn = false;
  }

  selectService(service: string) {
    this.selectedService = service;
    this.bookingForm.patchValue({
      serviceType: service
    });
    console.log('Selected service:', service);
  }

  onSubmit() {
    console.log('Form submitted', this.bookingForm.value);

    // Mark all fields as touched
    Object.keys(this.bookingForm.controls).forEach(key => {
      const control = this.bookingForm.get(key);
      control?.markAsTouched();
    });

    if (this.bookingForm.invalid) {
      console.log('Form is invalid', this.bookingForm.errors);
      return;
    }

    // Show confirmation dialog before submitting
    if (!confirm('Are you sure you want to submit this booking?')) {
      return;
    }

    const formValues = this.bookingForm.value;
    let dateYear = '', dateMonth = '', dateDay = '';

    if (formValues.travelDate) {
      const dateObj = new Date(formValues.travelDate);
      dateYear = dateObj.getFullYear().toString();
      dateMonth = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      dateDay = dateObj.getDate().toString().padStart(2, '0');

      if (dateObj < new Date()) {
        alert("Please select a valid future date.");
        return;
      }
    }

    // Add +91 prefix to phone number
    const phoneWithPrefix = '+91' + formValues.phoneNo;

    try {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = this.googleFormUrl;
      form.target = 'hidden_iframe';
      form.style.display = 'none';

      // Create hidden iframe
      const iframe = document.createElement('iframe');
      iframe.name = 'hidden_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // Create the form inputs
      const formInputs = {
        'entry.1670546575': formValues.name,
        'entry.1404757713': phoneWithPrefix,
        'entry.1099788403': formValues.email,
        'entry.651171631': formValues.origin,
        'entry.580776481': formValues.destination,
        'entry.1738291163': `${dateYear}-${dateMonth}-${dateDay}`,
        'entry.1374543558': formValues.pickupAddress,
        'entry.1684372066': formValues.dropAddress,
        'entry.1315141542': formValues.noOfPassengers,
        'entry.442473399': formValues.selectVehicle,
        'entry.1269381896': formValues.vehicleType,
        'entry.886513595': formValues.remarks
      };

      // Add inputs to form
      Object.entries(formInputs).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      // Show confirmation message
      const confirmationMessage = `
        Booking Details:
        ---------------
        Name: ${formValues.name}
        Email: ${formValues.email}
        Phone: ${phoneWithPrefix}
        From: ${formValues.origin}
        To: ${formValues.destination}
        Date: ${formValues.travelDate}
        Number of Passengers: ${formValues.noOfPassengers}
        Vehicle: ${formValues.selectVehicle}
        Vehicle Type: ${formValues.vehicleType}
        Your booking has been submitted successfully!
        Our Team Representative will Connect Shortly.`;

      setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
        this.bookingForm.reset();
        alert(confirmationMessage);
      }, 1000);

    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting form. Please try again.');
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }
}
