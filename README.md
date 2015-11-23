# cerebral-addons
An actions and factories utility belt for Cerebral

#### copyInputToState
Copies a property of the action input to the store, nested paths are supported by using `['parent', 'child']` syntax.

* `copyInputToState(inputPath, statePath)`

```js
signal('settingsOpened',
  [
    getServerSettings, {
      success: [
        copyInputToState('serverSettings', 'settings')
      ]
      error: []
    }
  ]
);
```

#### copyStateToOutput
Copies a property of the store to the output of the action

* `copyStateToOutput(statePath, outputPath)`

```js
signal('newAccountCreated',
  copyStateToOutput('newAccount', ['postData', 'newAccount']),
  [
    ajax.post({ url: '/new-account', inputDataPath: 'postData' }), {
      success: []
      error: []
    }
  ]
);
```

#### resetState

* `resetState(controller)` reset the whole store
* `resetState(controller, nodeName)` reset a node within the store

```js
// reset the whole store
signal('signedOut',
  resetState(controller)
);

// in order to reset individual nodes of the store it is first
// necessary to store the initial state during the controller setup
let state = {
  isLoading: false,
  form: {
    initialValue: 1
  }
};
let controller = Controller(Model(state), services);
controller.store.initialState = state;

// then you can reset parts of the store
signal('formResetClicked',
  resetState(controller, 'form')
);
```

#### set

* `set(statePath, value)`

```js
signal('optionsFormOpened',
  set('isLoading', 'true'),
  [getOptionsFromServer, {
    success: [],
    error: []
  }],
  set('isLoading', 'false')
);
```

#### setWindowTitle

* `setWindowTitle(title)`

```js
signal('optionsFormOpened',
  setWindowTitle('Options - Cerebral App')
);
```

#### timeout (async)
```js
// Run a single action
signal('appMounted',
  timeout(1000, myAction)
);

// Run a chain
signal('appMounted',
  timeout(1000, myActionChain)
);

// Run async parallell
signal('appMounted',
  [
    otherAsyncAction,
    ...timeout(1000, myAction)
  ]
);
```

#### timer
Timer consistes of 4 action factories, they are all async so that they are skipped over by the debugger when replaying signals.

* `timer.start(timerKey, timeout, {
  timeout: [onTimeoutActionsArray],
  cancel: [onCancelActionsArray]
})`
* `timer.pause(timerKey)`
* `timer.restart(timerkey)`
* `timer.cancel(timerkey, outputData)`

Simple case:

```js
signal('messageReceived',
  showMessageToUser,
  timer.start('message', 5000),
  hideMessageFromUser
);
```

More complex case:

```js
signal('messageReceived',
  showMessageToUser,
  timer.start('message', 5000, {
    timeout: [
      onTimeoutAction
    ],
    cancel: [
      onCancelAction
    ]
  }),
  hideMessageFromUser
);

signal('mouseHoveredOverMessage',
  timer.pause('message')
);

signal('mouseOutMessage',
  timer.restart('message')
);

signal('userDismissedMessage',
  // any data passed in the optional second parameter will
  // be forwarded to the onCancelAction input
  timer.cancel('message', optionalData)
);
```

#### toggle

* `toggle(statePath)`

```js
// toggle the menu between true and false
signal('menuToggled',
  toggle('menu')
);

// toggle the switch between "On" and "Off"
signal('switchToggled',
  toggle('switch', 'On', 'Off')
);
```

#### unset

* `unset(statePath)`

```js
signal('itemDeleted',
  unset('item')
);

#### validation

* `validate.email(statePath, { errorPath=null, errorKey=null})`
* `validate.required(statePath, { errorPath=null, errorKey=null })`
* `validate.equal(statePath, compareStatePath, { errorPath=null, errorKey = null})`
* `validate.password(statePath, passwordOptions)`
* `validate.check(statePath)` checks if statePath passed all validations and outputs either `isValid` or `isInvalid` paths

```js
//password options:
{
  errorPath = null,
  errorKey = null,
  minLength = 8,
  maxLength = 128,
  minPhraseLength = 20,
  minPassingTests = 3, // if shorter than phrase, must pass at least 3 of the given tests
  tests = [
    /[a-z]/,
    /[A-Z]/,
    /[0-9]/,
    /[^A-Za-z0-9]/
  ]
}
```

Validation functions are designed to be used alongside an i18n library, so instead of outputing error messages, validations set or unset an `errorKey` on the store (`errorKey: 'Human readable message'` could be used if you don't want to use keys in your view later). If an error key is provided it will be used, otherwise a key will be auto-generated by taking the last element of the statePath and adding one of the following suffix's

* for email and password: `Invalid`
* for required: `Required`
* for equal: `NotEqual`

`errorPath` is the location in the store where the `errorKey` will be set or unset. If not provided then the path will be auto-generated by inserting `validation` as the last but one item in the given statePath.

So for example `validate.email(['signupForm', 'email'])` will call `state.set(['signupForm', 'validation', 'email'], 'emailInvalid')` when the email is invalid or unset the same path when valid.

The password valdation comes with some reasonable defaults, but can easily be customised via an extensive set of options.

`validate.check(statePath)` can be used to assert that all previous validation have passed before proceding with furter actions, `'validation'` will be pushed onto the statePath before running the check, so it works well when following a chain of validation actions.

```js
controller.signal('signinEmailChanged',
  copyInputToState('value', ['signin', 'email']),
  validate.email(['signin', 'email'])
);

controller.signal('siginPasswordChanged',
  copyInputToState('value', ['signin', 'password']),
  validate.required(['signin', 'password'])
);

controller.signal('signinRequested',
  validate.email(['signin', 'email']),
  validate.required(['signin', 'password']),
  validate.check('signin'), {
    isValid: [
      copyStateToOutput('signin', 'data'),
      [ajax.post({ url: '/signin'}), {
        success: [
          copyInputToState('user', 'user'),
          redirectToStartPage
        ],
        error: [
          showErrorMessage
        ]
      }]
    ],
    isInvalid: [
      showErrorMessage
    ]
  }
);

```

#### when

* `when(statePath, truePath='isTrue', falsePath='isFalse')`

```js
let whenUser = when('user', 'isLoggedIn', 'isUnknown');

signal('securePageOpened',
  whenUser, {
    isLoggedIn: [getPageData],
    isUnknown: [redirectToHome]
  }
);
```

## Contribute

Fork repo

* `npm install`
* `npm run dev` runs dev mode which watches for changes and auto lints, tests and builds
* `npm test` runs the tests
* `npm run lint` lints the code
* `npm run build` compiles es6 to es5
