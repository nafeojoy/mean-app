import Counter from '../../models/seq.counter.model';

export function getNextSequence(name) {
  return new Promise((resolve, reject) => {
    Counter.findByIdAndUpdate({
      _id: name
    }, {
      $inc: {
        seq: 1
      }
    }, {
      new: true
    }, function (error, counter) {
      if (error) {
        reject(error)
      }
      resolve(counter.seq)
    });
  });
}


export function imageIndex(value) {
  let p = parseInt(value / 1000);
  let q = value % 1000;
  return q > 0 ? (p * 1000) + 1000 : (p - 1) * 1000 + 1000;
}

export function getCurrentSeq(name) {
  return new Promise((resolve, reject) => {
    Counter.findOne({
        _id: name
      })
      .exec()
      .then(counter => {
        resolve(counter.seq)
      })
      .catch(err => {
        reject(err);
      })
  })
}
