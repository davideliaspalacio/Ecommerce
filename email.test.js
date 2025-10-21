import { Resend } from 'resend';

const resend = new Resend('nono!');

await resend.emails.send({
  from: 'Elias <elias@enoughh.shop>',
  to: ['gamerpg08@gmail.com'],
  subject: 'Prueba de correo con dominio ENOUGHH!!',
  html: '<p>Este es un correo de prueba con dominio ENOUGHH!</p>',
});