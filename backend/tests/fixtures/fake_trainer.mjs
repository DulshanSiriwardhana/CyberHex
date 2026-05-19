#!/usr/bin/env node
/**
 * Fast fake trainer for integration tests — emits cyberhex.train.v1 JSON lines.
 */
const config = JSON.parse(process.env.CYBERHEX_CONFIG || '{}');
const epochs = Math.min(config.epochs ?? 2, 3);

console.log(JSON.stringify({ type: 'log', message: 'Fake trainer started' }));

for (let e = 1; e <= epochs; e++) {
  const train_loss = 1 / e;
  const val_loss = train_loss * 1.1;
  console.log(JSON.stringify({ type: 'epoch', epoch: e, train_loss, val_loss }));
}

const model_path = process.env.CYBERHEX_FAKE_MODEL_PATH || '/tmp/cyberhex_fake_model.npz';
console.log(
  JSON.stringify({
    type: 'training_complete',
    final_train_loss: epochs > 0 ? 1 / epochs : 0,
    final_val_loss: epochs > 0 ? 1.1 / epochs : 0,
    model_path,
  })
);
