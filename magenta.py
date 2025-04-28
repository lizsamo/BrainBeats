import BrainBeats.magenta as magenta
from magenta.models.music_vae import TrainedModel
from magenta.models.music_vae import configs
from magenta.music import midi_io
import tensorflow.compat.v1 as tf
tf.disable_v2_behavior()

def generate_music():
    # Load the pre-trained model configuration (MusicVAE, LSTM model)
    config_name = 'cat-mel_2bar_big'
    config = configs.CONFIG_MAP[config_name]
    
    # Load the trained model
    model = TrainedModel(config, batch_size=1, checkpoint_dir_or_path='gs://magenta-models/music_vae/cat-mel_2bar_big.tar')

    # Generate a sequence from the model
    z = model.sample(n=1, length=80, temperature=1.0)
    
    # Convert the sequence into a midi file
    generated_midi = model.decode(z, length=80)

    # Write the generated midi to a file
    midi_io.sequence_proto_to_midi_file(generated_midi[0], 'generated_music.mid')
    print("Music generated and saved to 'generated_music.mid'")

if __name__ == '__main__':
    generate_music()
