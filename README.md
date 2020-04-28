# Project Title

Etherchat is a very simple chat service on-the-fly. If you need a temporary
chat room for your team just create a new room.

## Features

- E2E encryption, 0 knowledge server
- No registration
- Desktop notifications
- Favicon with unread counter

## Getting Started

These instructions will get you a copy of the project up and running on your
local machine for development and testing purposes.
See deployment for notes on how to deploy the project on a live system.

### Prerequisites

The project need the latest stable nodejs. You can use nvm with the `.nvmrc` file.

### Installing

To start an instance you must compile the React frontend:

```sh
npm ci
npm run build
```

Then you can start the server:

```sh
node server/index.js
```

then visit http://localhost:4000 and start chatting.

## Deployment

You have a docker file in `docker` dir.

## Built With

- [React](https://reactjs.org/) - The web framework
- [Socket.io](https://socket.io/) - For realtime communication

## Contributing

Please read [CONTRIBUTING.md]() for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

- **Jérémie Pardou** - _Initial work_ - [jrmi](https://github.com/jrmi)

See also the list of [contributors]() who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Roadmap

### v0.1

- [x] Desktop notifications
- [x] e2e cryptography
- [x] Favicon new message count
- [x] Handle reset count on not idle
- [x] Add Home page
- [x] Persist crypted messages server side
- [x] Load previous message from server
- [x] Serve file from express
- [x] Allow backend url configuration at build
- [x] Can customize user name
- [ ] Show connected users
- [ ] Better style
- [ ] Custom favicon
- [ ] Add ci
- [ ] Add tests
- [ ] Improve Readme

### v0.2

- [ ] Add typing notification
- [ ] Allow backend url configuration at runtime
- [ ] Show connected users
- [ ] Responsive
- [ ] Save user name in Localstorage
- [ ] Close notifications popup with settimeout
- [ ] i18n

### v0.3

- [ ] Service worker with offline support
- [ ] Paginate previous messages from server
- [ ] Markdown messages
- [ ] Show time on all messages in group if asked
- [ ] Docker Image
- [ ] Group notification
- [ ] Add avatars

### v0.4

- [ ] Push notification for mobile
- [ ] Improve security
- [ ] Emojies
- [ ] File sharing/transfert
- [ ] Merge grouped message
- [ ] Allow previous message correction
