import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl:'login.component.html',
  styleUrl:'login.component.css',
})
export class LoginComponent {
  form !: FormGroup;
  
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(){
    this.form=this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  }
  onSubmit() {
    if (this.form.valid) {
      const { username, password } = this.form.value;
      this.authService.login(username!, password!).subscribe((res: any) => {
        if (res) {
          this.router.navigate(['/products']);
        } else {
          alert('Invalid credentials');
        }
      });
    }
  }
}
