import os
import pickle
import numpy as np
from tensorflow.keras.models import load_model
from huggingface_hub import hf_hub_download  # ⬅️ NEW


class KeywordGenerator:
    def __init__(self, model_path=None, vocab_path=None):
        # Always load from Hugging Face (cached automatically)
        if model_path is None:
            model_path = hf_hub_download(
                repo_id="prajyotgorlewar/moodstoryLSTM",  # your HF repo
                filename="keywordgen_model.keras"        # model file in that repo
            )

        if vocab_path is None:
            vocab_path = hf_hub_download(
                repo_id="prajyotgorlewar/moodstoryLSTM",
                filename="vocab.pkl"                     # vocab file in that repo
            )

        self.model = load_model(model_path)

        with open(vocab_path, "rb") as f:
            (
                self.ivocab,
                self.emo2id,
                self.PAD_ID,
                self.SOS_ID,
                self.EOS_ID,
                self.TGT_MAXLEN,
            ) = pickle.load(f)

    def beam_search(self, emotion_label, beam_width=3, max_len=None):
        if max_len is None:
            max_len = self.TGT_MAXLEN

        e_id = np.array([self.emo2id[emotion_label]], dtype=np.int32)
        beam = [([self.SOS_ID], 0.0)]  # start with SOS
        results = []

        for _ in range(max_len):
            new_beam = []
            for seq, score in beam:
                dec_seq = np.full((1, max_len), self.PAD_ID, dtype=np.int32)
                dec_seq[0, :len(seq)] = seq

                # predict next-token probs
                probs = self.model.predict([e_id, dec_seq], verbose=0)[0, len(seq) - 1]

                # top-k candidates
                top_ids = np.argsort(probs)[-beam_width:]

                for tok_id in top_ids:
                    new_seq = seq + [tok_id]
                    new_score = score - np.log(probs[tok_id] + 1e-9)

                    if tok_id == self.EOS_ID:
                        results.append((new_seq, new_score))
                    else:
                        new_beam.append((new_seq, new_score))

            # keep best beams
            beam = sorted(new_beam, key=lambda x: x[1])[:beam_width]

        # include any unfinished sequences
        results.extend(beam)
        results = sorted(results, key=lambda x: x[1])

        # convert IDs → tokens
        decoded_sequences = []
        for seq, score in results:
            toks = [
                self.ivocab.get(i, "<UNK>")
                for i in seq
                if i not in (self.PAD_ID, self.SOS_ID, self.EOS_ID)
            ]
            decoded_sequences.append((" ".join(toks), score))

        return decoded_sequences
