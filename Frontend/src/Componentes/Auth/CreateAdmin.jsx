import React, { useState } from 'react';
import { useForm } from 'react-hook-form'; //npm i react-hook-form
import { yupResolver } from "@hookform/resolvers/yup"; //npm i @hookform/resolvers
import * as yup from "yup"; //npm i yup
import axios from 'axios'; //npm i axios
import { Navigate, Link } from 'react-router-dom';
import mqtt from 'mqtt';
import '../CSS/Auth/Cadastro.css'

const schema = yup.object({
  username: yup.string().required('Usuário obrigatório'),
  email: yup.string().email('Email invalido').required('Email obrigatório'),
  password: yup.string().min(4, 'Senha com no mínimo 4 caracteres').required(),
  passwordConf: yup.string().required('Confirme a senha').oneOf([yup.ref('password')], 'As senhas devem ser iguais!'),
  cpf: yup.string().required('CPF é obrigatório').length(11, 'CPF deve ter 11 caracteres'),
  endereco: yup.string().required('Endereço é obrigatório'),
  telefone: yup.string().required('Telefone é obrigatório').matches(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato de telefone inválido'),
  cip: yup.string().required('CIP é obrigatória').length(7, 'CIP deve ter 7 caracteres'),
}).required();

export default function CreateAdmin() {

  const [msg, setMsg] = useState();

  const form = useForm({
    resolver: yupResolver(schema)
  });

  const { register, handleSubmit, formState } = form;
  const { errors } = formState;

  const submit = async (data) => {
    const client = mqtt.connect('wss://b7f0aae8c6514adeb1fb7f81c1743e30.s1.eu.hivemq.cloud:8884/mqtt', {
      username: 'Gamaia',
      password: 'Maia1234'
    });
    
    const payload = JSON.stringify({
      username: data.username,
      email: data.email,
      password: data.password,
      cpf: data.cpf,
      endereco: data.endereco,
      telefone: data.telefone,
      cip: data.cip
    })
  
    client.on('connect', () => {
      console.log('Conectado ao broker MQTT via WebSocket');
      client.subscribe('psicologo/AutorizacaoCreate', (err) => {
        if (err) {
          console.log('Erro ao subscrever no tópico:', err);
        } else {
          console.log('Inscrito no tópico psicologo/AutorizacaoCreate');
        }
      });
    });
  
    client.on('message', (topico, message) => {
      if (topico === 'psicologo/AutorizacaoCreate') {
        const dados = JSON.parse(message.toString());
        console.log('Dados recebidos:', dados);
        if(dados.status === 200)
          setMsg('OK');
      }
    });
  
    // Publicar mensagem no tópico
    client.publish('psicologo/create', payload, () => {
      console.log('Solicitação enviada ao tópico psicologo/create');
    });
  }

  if (msg === 'OK')
    return <Navigate to='/' />

  return (
    <>
      <div className="container">
        <div className="card">
          <h2>Cadastrar Psicologo</h2>
          <form onSubmit={handleSubmit(submit)} noValidate>
            
            <div className="form-group">
              <label htmlFor="username">Nome</label>
              <input type="text" id='username' {...register('username')} />
              <p className='erro'> {errors.username?.message} </p>
            </div>
  
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="text" id='email' {...register('email')} />
              <p className='erro'> {errors.email?.message} </p>
            </div>
  
            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input type="password" id='password' {...register('password')} />
              <p className='erro'> {errors.password?.message} </p>
            </div>
  
            <div className="form-group">
              <label htmlFor="passwordConf">Confirmar Senha</label>
              <input type="password" id='passwordConf' {...register('passwordConf')} />
              <p className='erro'> {errors.passwordConf?.message} </p>
            </div>
  
            {/* Campo CPF */}
            <div className="form-group">
              <label htmlFor="cpf">CPF</label>
              <input type="text" id='cpf' {...register('cpf')} />
              <p className='erro'> {errors.cpf?.message} </p>
            </div>
  
            {/* Campo Endereço */}
            <div className="form-group">
              <label htmlFor="endereco">Endereço</label>
              <input type="text" id='endereco' {...register('endereco')} />
              <p className='erro'> {errors.endereco?.message} </p>
            </div>
  
            {/* Campo Telefone */}
            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input type="text" id='telefone' {...register('telefone')} />
              <p className='erro'> {errors.telefone?.message} </p>
            </div>
  
            {/* Campo CIP */}
            <div className="form-group">
              <label htmlFor="cip">CIP</label>
              <input type="text" id='cip' {...register('cip')} />
              <p className='erro'> {errors.cip?.message} </p>
            </div>
  
            <div className="buttons">
              <button type="submit">Registrar</button>
            </div>
          </form>
          <p className='server-response'>{msg}</p>
          <Link to='/pagina-inicial'>Voltar</Link>
        </div>
      </div>
    </>
  );
}
